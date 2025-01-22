import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradeInput } from './dto/trade.dto';
import { Stock } from 'src/database/stock.entity';
import { Trade } from 'src/database/trade.entity';
import { StockHistory } from 'src/database/stockHistory.entity';
import { TradeHistory } from 'src/database/tradeHistory.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockHistory)
    private readonly stockHistoryRepository: Repository<StockHistory>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
  ) {}

  async tradeStock(input: TradeInput) {
    const orders = await this.tradeRepository.find({
      where: { price: input.price, code: input.code, type: input.type },
      order: { createdAt: 'ASC' },
    });

    return this.handleOrders(orders, input);
  }

  private async handleOrders(sellOrders: Trade[], input: TradeInput) {
    for (let order of sellOrders) {
      console.log('order :', order);
      // 매도 주문 수량 > 매수 주문 수량
      if (order.quantity > input.quantity) {
        order.quantity -= input.quantity; // 매도 남은 수량 업데이트
        await this.tradeRepository.save(order);
        await this.createTradeHistory(input); // 거래 내역 기록 (//TODO: 타입 추가)
        break;
        // 매도 주문 수량 < 매수 주문 수량
      } else if (order.quantity < input.quantity) {
        input.quantity -= order.quantity; // 매수 남은 수량 업데이트
        await this.tradeRepository.delete(order); // 매도 주문 삭제
        await this.createTradeHistory(input); // 거래 내역 기록 (//TODO: 타입 추가)
        continue;
        // 매도 주문 수량 == 매수 주문 수량
      } else {
        await this.tradeRepository.delete(order); // 매도 주문 삭제
        await this.createTradeHistory(input); // 거래 내역 기록 (//TODO: 타입 추가)
        break;
      }

      // TODO: 테스트
    }

    return { success: true };
  }
  private async ArrangeMarketPrice(
    stockHistory: StockHistory,
    buyPrice: number,
  ) {
    if (stockHistory.marektPrice > buyPrice) {
      stockHistory.marektPrice = buyPrice;
      stockHistory.lowPrice = buyPrice;
    }
  }

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
