import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradeInput, TradeOutput } from './dto/trade.dto';
import { Stock } from 'src/database/stock.entity';
import { Trade, TradeType } from 'src/database/trade.entity';
import { StockHistory } from 'src/database/stockHistory.entity';
import { TradeHistory } from 'src/database/tradeHistory.entity';

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

  /** 타입에 따른 주식 거래 체결 */
  async tradeStock(input: TradeInput) {
    if (input.type === 'BUY') {
      const orders = await this.tradeRepository.find({
        where: { price: input.price, code: input.code, type: TradeType.SELL },
        order: { createdAt: 'ASC' },
      });

      if (orders.length === 0) {
        await this.tradeRepository.save(input); // 매수 주문 저장
        return { isSuccess: true };
      }

      return this.buyStocks(orders, input);
    } else if (input.type === 'SELL') {
      const orders = await this.tradeRepository.find({
        where: { price: input.price, code: input.code, type: TradeType.BUY },
        order: { createdAt: 'ASC' },
      });

      if (orders.length === 0) {
        await this.tradeRepository.save(input); // 매수 주문 저장
        return { isSuccess: true };
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
          quantity: order.quantity,
        });
        continue;
        // 매도 주문 수량 < 매수 주문 수량
      } else if (input.quantity < order.quantity) {
        order.quantity -= input.quantity;
        await this.tradeRepository.save(order); // 매수 남은 수량 업데이트
        await this.createTradeHistory({
          ...input,
          quantity: order.quantity,
        });
        break;
        // 매도 주문 수량 == 매수 주문 수량
      } else {
        await this.tradeRepository.delete(order.id); // 매수 주문 삭제
        await this.createTradeHistory({
          ...input,
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
          quantity: order.quantity,
        });
        continue;
        // 매수 주문 수량 < 매도 주문 수량
      } else if (input.quantity < order.quantity) {
        order.quantity -= input.quantity;
        await this.tradeRepository.save(order); // 매도 남은 수량 업데이트
        await this.createTradeHistory({
          ...input,
          quantity: order.quantity,
        });
        break;
        // 매도 주문 수량 == 매수 주문 수량
      } else if (input.quantity === order.quantity) {
        await this.tradeRepository.delete(order.id); // 매도 주문 삭제
        await this.createTradeHistory({
          ...input,
          quantity: order.quantity,
        });
        break;
      }
    }

    return { isSuccess: true };
  }

  /** 거래 내역 생성 */
  private async createTradeHistory(input: TradeInput) {
    console.log('input :', input);
    const tradeHistory = this.tradeHistoryRepository.create({
      code: input.code,
      quantity: input.quantity,
      price: input.price,
      userId: 1, // mock
    });

    await this.tradeHistoryRepository.save(tradeHistory);
  }
}
