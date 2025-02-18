import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { TradeInput } from './dto/trade.dto';
import { Trade, TradeType } from 'src/database/entity/trade.entity';
import {
  TradeHistory,
  TradeHistoryType,
} from 'src/database/entity/tradeHistory.entity';
import { TradeHistoryInput } from './dto/trade-history.dto';
import { User } from 'src/database/entity/user.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
  ) {}

  /** 전체 호가 조회 */
  async getAllTrades(input: TradeInput) {
    return await this.tradeRepository.find({ where: { code: input.code } });
  }

  /** 거래 체결 내역 조회 */
  async getTradeHistory(input: TradeInput) {
    return await this.tradeHistoryRepository.find({
      where: { code: input.code },
    });
  }

  /** 시장가 주문 체결 및 예약 */
  async tradeStock(input: TradeInput, user: User) {
    const tradeType =
      input.type === TradeType.BUY ? TradeType.SELL : TradeType.BUY;

    const ordersToBuy = await this.tradeRepository.find({
      where: {
        code: input.code,
        type: tradeType,
        price: LessThanOrEqual(input.price),
      },
      order: { price: 'ASC', createdAt: 'ASC' },
    });

    const ordersToSell = await this.tradeRepository.find({
      where: { code: input.code, type: tradeType, price: Equal(input.price) },
      order: { price: 'ASC', createdAt: 'ASC' },
    });

    if (ordersToBuy.length === 0 || ordersToSell.length === 0) {
      await this.tradeRepository.save({
        ...input,
        userId: user.id,
        user: user,
      });

      return {
        isSuccess: true,
        message: '체결할 주문이 없습니다. 잔여 주문이 완료되었습니다.',
      };
    }

    return tradeType === TradeType.BUY
      ? this.sellStocks(ordersToSell, input, user)
      : this.buyStocks(ordersToBuy, input, user);
  }

  /** 매도 */
  private async sellStocks(sellOrders: Trade[], input: TradeInput, user: User) {
    for (let order of sellOrders) {
      // 매도 수량 > 매수 수량
      if (input.quantity > order.quantity) {
        await this.createTradeHistory({
          code: input.code,
          price: order.price,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
          seller: user.id,
          buyer: order.userId,
        });
        input.quantity -= order.quantity; // input 값 남아있는 상태
        await this.tradeRepository.delete(order.id); // 매수 주문 삭제
      } else if (input.quantity < order.quantity) {
        await this.createTradeHistory({
          code: input.code,
          price: order.price,
          type: TradeHistoryType.SPLIT_TRADE,
          quantity: input.quantity,
          seller: user.id,
          buyer: order.userId,
        });
        order.quantity -= input.quantity;
        input.quantity = 0;
        await this.tradeRepository.save(order); // 매수 남은 수량 업데이트
        // 매도 주문 수량 == 매수 주문 수량
      } else if (input.quantity === order.quantity) {
        await this.createTradeHistory({
          code: input.code,
          price: order.price,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
          seller: user.id,
          buyer: order.userId,
        });
        input.quantity = 0;
        await this.tradeRepository.delete(order.id); // 매수 주문 삭제
      }

      // input.quantity가 0이 되면 루프 종료
      if (input.quantity === 0) {
        break;
      }
    }

    // 남은 주문이 있는 경우 남은 수량 저장
    if (input.quantity > 0) {
      await this.tradeRepository.save({
        ...input,
        userId: user.id,
        user: user,
      });
    }
    return { isSuccess: true };
  }

  /** 매수 */
  private async buyStocks(buyOrders: Trade[], input: TradeInput, user: User) {
    for (let order of buyOrders) {
      // 매수 수량 > 매도 수량
      if (input.quantity > order.quantity) {
        await this.createTradeHistory({
          code: input.code,
          price: order.price,
          type: TradeHistoryType.SPLIT_TRADE,
          quantity: order.quantity,
          seller: order.userId,
          buyer: user.id,
        });
        input.quantity -= order.quantity;
        await this.tradeRepository.delete(order.id); // 매도 주문 삭제
        // 매수 수량 < 매도 수량
      } else if (input.quantity < order.quantity) {
        await this.createTradeHistory({
          code: input.code,
          price: order.price,
          type: TradeHistoryType.ALL_TRADE,
          quantity: input.quantity,
          seller: order.userId,
          buyer: user.id,
        });
        order.quantity -= input.quantity;
        input.quantity = 0;
        await this.tradeRepository.save(order); // 매도 남은 수량 업데이트
        // 매도 주문 수량 == 매수 주문 수량
      } else if (input.quantity === order.quantity) {
        await this.createTradeHistory({
          ...input,
          price: order.price,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
          seller: order.userId,
          buyer: user.id,
        });
        input.quantity = 0;
        await this.tradeRepository.delete(order.id); // 매도 주문 삭제
      }

      // input.quantity가 0이 되면 루프 종료
      if (input.quantity === 0) {
        break;
      }
    }

    // 남은 주문이 있는 경우 남은 수량 저장
    if (input.quantity > 0) {
      await this.tradeRepository.save({
        ...input,
        userId: user.id,
        user: user,
      });
    }
    return { isSuccess: true };
  }

  /** 거래 내역 생성 */
  private async createTradeHistory(input: TradeHistoryInput) {
    const tradeHistory = this.tradeHistoryRepository.create({
      code: input.code,
      quantity: input.quantity,
      type: input.type,
      price: input.price,
      seller: input.seller,
      buyer: input.buyer,
    });

    await this.tradeHistoryRepository.save(tradeHistory);
  }
}
