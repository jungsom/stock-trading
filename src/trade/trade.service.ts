import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { TradeInput } from './dto/trade.dto';
import { Trade, TradeType } from 'src/database/entity/trade.entity';
import {
  TradeHistory,
  TradeHistoryType,
} from 'src/database/entity/tradeHistory.entity';
import { TradeHistoryInput } from './dto/trade-history.dto';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
  ) {}

  /** 남은 주식 거래 조회 */
  async getAllTrades(input: TradeInput) {
    const trades = await this.tradeRepository.find({
      where: { code: input.code },
    });
    return trades;
  }

  /** 타입에 따른 주식 거래 체결 ) 시장가 주문 */
  async tradeStock(input: TradeInput) {
    if (input.type === 'BUY') {
      const orders = await this.tradeRepository.find({
        where: { code: input.code, type: TradeType.SELL },
        order: { price: 'ASC', createdAt: 'ASC' },
      });

      console.log('✅ orders:', orders);

      if (orders.length === 0) {
        await this.tradeRepository.save(input); // 매수 주문 저장
        return {
          isSuccess: true,
          message:
            '체결할 매도 주문이 없습니다. 잔여 매수 주문이 완료되었습니다.',
        };
      }

      return this.buyStocks(orders, input);
    } else if (input.type === 'SELL') {
      const orders = await this.tradeRepository.find({
        where: { price: input.price, code: input.code, type: TradeType.BUY },
        order: { createdAt: 'ASC' },
      });

      if (orders.length === 0) {
        await this.tradeRepository.save(input); // 매도 주문 저장
        return {
          isSuccess: true,
          message:
            '체결할 매수 주문이 없습니다. 잔여 매도 주문이 완료되었습니다.',
        };
      }

      return this.sellStocks(orders, input);
    }
  }

  /** 주식 거래가 매도인 경우 */
  private async sellStocks(sellOrders: Trade[], input: TradeInput) {
    for (let order of sellOrders) {
      // 매도 주문 수량 > 매수 주문 수량
      if (input.quantity > order.quantity) {
        input.quantity -= order.quantity;
        await this.tradeRepository.save(input); // 매도 남은 수량 업데이트
        await this.tradeRepository.delete(order.id); // 매수 주문 삭제
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
        });
        continue;
        // 매도 주문 수량 < 매수 주문 수량
      } else if (input.quantity < order.quantity) {
        order.quantity -= input.quantity;
        await this.tradeRepository.save(order); // 매수 남은 수량 업데이트
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.SPLIT_TRADE,
          quantity: order.quantity,
        });
        break;
        // 매도 주문 수량 == 매수 주문 수량
      } else {
        await this.tradeRepository.delete(order.id); // 매수 주문 삭제
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
        });
        break;
      }
    }

    return { isSuccess: true };
  }

  /** 주식 거래가 매수인 경우 */
  private async buyStocks(buyOrders: Trade[], input: TradeInput) {
    for (let order of buyOrders) {
      // 매수 주문 수량 > 매도 주문 수량
      if (input.quantity > order.quantity) {
        input.quantity -= order.quantity;
        await this.tradeRepository.save(input); // 매수 남은 수량 업데이트
        await this.tradeRepository.delete(order.id); // 매도 주문 삭제
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.SPLIT_TRADE,
          quantity: order.quantity,
        });
        continue;
        // 매수 주문 수량 < 매도 주문 수량
      } else if (input.quantity < order.quantity) {
        order.quantity -= input.quantity;
        await this.tradeRepository.save(order); // 매도 남은 수량 업데이트
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
        });
        break;
        // 매도 주문 수량 == 매수 주문 수량
      } else if (input.quantity === order.quantity) {
        await this.tradeRepository.delete(order.id); // 매도 주문 삭제
        await this.createTradeHistory({
          ...input,
          type: TradeHistoryType.ALL_TRADE,
          quantity: order.quantity,
        });
        break;
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
      userId: 1, // mock,
    });

    await this.tradeHistoryRepository.save(tradeHistory);
  }

  // 매수 가격 > 매도 가격 일 시, 체크
  async checkCurrentPrice(input: TradeInput) {
    console.log('checkCurrentPrice input:', input);

    const lowestSellOrder = await this.tradeRepository.findOne({
      where: { price: LessThan(input.price), type: TradeType.SELL },
      order: { price: 'ASC' },
    });

    return lowestSellOrder;
  }
}
