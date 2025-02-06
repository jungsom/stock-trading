import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
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

  /** 시장가 주문 체결 및 예약 */
  async tradeStock(input: TradeInput, user: User) {
    const tradeType =
      input.type === TradeType.BUY ? TradeType.SELL : TradeType.BUY;

    const orders = await this.tradeRepository.find({
      where: { code: input.code, type: tradeType },
      order: { price: 'ASC', createdAt: 'ASC' },
    });

    if (orders.length === 0) {
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
      ? this.buyStocks(orders, input, user)
      : this.sellStocks(orders, input, user);
  }

  /** 매도 */
  private async sellStocks(sellOrders: Trade[], input: TradeInput, user: User) {
    let remainingQuantity = input.quantity; // 남은 수량을 별도 변수로 관리

    for (let order of sellOrders) {
      if (remainingQuantity <= 0) break; // 남은 수량이 없으면 거래 종료

      if (remainingQuantity > order.quantity) {
        // 매도 주문 수량 > 매수 주문 수량
        remainingQuantity -= order.quantity;
        await this.tradeRepository.delete(order.id); // 매수 주문 삭제
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
          seller: user.id,
          buyer: order.userId,
        });
      } else {
        // 매도 주문 수량 <= 매수 주문 수량
        order.quantity -= remainingQuantity;
        await this.tradeRepository.save(order); // 남은 수량 업데이트

        await this.createTradeHistory({
          ...input,
          type:
            remainingQuantity === order.quantity
              ? TradeHistoryType.ALL_TRADE
              : TradeHistoryType.SPLIT_TRADE,
          quantity: remainingQuantity,
          seller: user.id,
          buyer: order.userId,
        });

        remainingQuantity = 0;
      }
    }

    return { isSuccess: true };
  }

  /** 매수 */
  private async buyStocks(buyOrders: Trade[], input: TradeInput, user: User) {
    let remainingQuantity = input.quantity; // 남은 수량을 별도 변수로 관리

    for (let order of buyOrders) {
      if (remainingQuantity <= 0) break; // 남은 수량이 없으면 거래 종료

      if (remainingQuantity > order.quantity) {
        // 매수 주문 수량 > 매도 주문 수량
        remainingQuantity -= order.quantity;
        await this.tradeRepository.delete(order.id); // 매도 주문 삭제
        await this.createTradeHistory({
          ...input,
          price: order.price,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
          seller: order.userId,
          buyer: user.id,
        });
      } else {
        // 매수 주문 수량 <= 매도 주문 수량
        order.quantity -= remainingQuantity;
        await this.tradeRepository.save(order); // 남은 수량 업데이트

        await this.createTradeHistory({
          ...input,
          price: order.price,
          type:
            remainingQuantity === order.quantity
              ? TradeHistoryType.ALL_TRADE
              : TradeHistoryType.SPLIT_TRADE,
          quantity: remainingQuantity,
          seller: order.userId,
          buyer: user.id,
        });

        remainingQuantity = 0;
      }
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
