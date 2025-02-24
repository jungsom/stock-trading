import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Equal,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
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
    const trades = await this.tradeRepository
      .createQueryBuilder('trade')
      .select('trade.price', 'price')
      .addSelect('trade.type', 'type')
      .addSelect('SUM(trade.quantity)', 'totalQuantity')
      .where('trade.code = :code', { code: input.code })
      .groupBy('trade.price')
      .addGroupBy('trade.type')
      .orderBy('trade.price', 'DESC')
      .getRawMany();

    return trades;
  }

  /** 전체 체결 내역 조회 */
  async getAllTradeHistorys(input: TradeInput) {
    return await this.tradeHistoryRepository.find({
      where: { code: input.code },
    });
  }

  /** 판매자 체결 내역 조회 */
  async getTradeHistoryBySeller(user: User) {
    console.log(user.id);
    return await this.tradeHistoryRepository.find({
      where: [{ buyer: user.id }, { seller: user.id }],
      order: { createdAt: 'DESC' },
    });
  }

  /** 구매자 체결 내역 조회 */
  async getTradeHistoryByBuyer(user: User) {
    console.log(user.id);
    return await this.tradeHistoryRepository.find({
      where: [{ buyer: user.id }, { seller: user.id }],
      order: { createdAt: 'DESC' },
    });
  }

  /** 최종 주문 체결 */
  async tradeStock(input: TradeInput, user: User) {
    const tradeType =
      input.type === TradeType.BUY ? TradeType.SELL : TradeType.BUY;

    const EqualPriceOrders = await this.tradeRepository.find({
      where: {
        code: input.code,
        price: Equal(input.price),
      },
      order: { createdAt: 'ASC' },
    });

    const ordersToBuy = await this.tradeRepository.find({
      where: {
        code: input.code,
        type: tradeType,
        price: LessThanOrEqual(input.price),
      },
      order: { price: 'ASC', createdAt: 'ASC' },
    });

    const ordersToSell = await this.tradeRepository.find({
      where: {
        code: input.code,
        type: tradeType,
        price: MoreThanOrEqual(input.price),
      },
      order: { price: 'ASC', createdAt: 'ASC' },
    });

    // 체결할 주문이 없을 시,
    if (ordersToSell.length === 0 || ordersToBuy.length === 0) {
      await this.tradeRepository.save({
        ...input,
        userId: user.id,
        user: user,
      });
      return {
        isSuccess: true,
        message: '체결할 주문이 없습니다. 잔여 매도 주문이 완료되었습니다.',
      };
    }

    // 체결할 주문 중 같은 가격이 있을 시,
    if (EqualPriceOrders.length > 0) {
      tradeType === TradeType.BUY
        ? await this.sellStocks(EqualPriceOrders, input, user)
        : await this.buyStocks(EqualPriceOrders, input, user);
    }

    if (input.quantity === 0) {
      return {
        isSuccess: true,
        message: '동일 가격으로 체결이 완료되었습니다.',
      };
    }

    // 체결할 주문 중 다른 가격이 있을 시,
    tradeType === TradeType.BUY
      ? await this.sellStocks(ordersToSell, input, user)
      : await this.buyStocks(ordersToBuy, input, user);

    if (input.quantity > 0) {
      await this.tradeRepository.save({
        ...input,
        userId: user.id,
        user: user,
      });
    }

    return { isSuccess: true };
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
    return input;
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

    return input;
  }

  /** 체결 내역 생성 */
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
