import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradeInput } from './dto/trade.dto';
import { Stock } from 'src/database/stock.entity';
import { Trade, TradeType } from 'src/database/trade.entity';
import { StockInput } from 'src/stock/dto/stock.dto';
import { StockHistory } from 'src/database/stockHistory.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockHistory)
    private readonly stockHistoryRepository: Repository<StockHistory>,
  ) {}

  async tradeStock(input: TradeInput) {
    const stock = await this.stockRepository.findOne({
      where: { code: input.code },
    });

    const stockHistory = await this.stockHistoryRepository.findOne({
      where: { code: input.code },
    });

    const orders = await this.tradeRepository.find({
      where: { price: input.price, code: input.code, type: input.type },
      order: { createdAt: 'ASC' },
    });

    return this.handleOrders(orders, input);
  }

  private async handleOrders(sellOrders: Trade[], input: TradeInput) {
    for (let order of sellOrders) {
      // 매도 주문 수량 > 매수 주문 수량
      if (order.quantity > input.quantity) {
        order.quantity -= input.quantity; // 매도 남은 수량 업데이트
        await this.tradeRepository.save(order);
        await this.createTradeHistory(input, order); // 거래 내역 기록 (//TODO: 타입 추가)
        break;
        // 매도 주문 수량 < 매수 주문 수량
      } else if (order.quantity < input.quantity) {
        input.quantity -= order.quantity; // 매수 남은 수량 업데이트
        await this.tradeRepository.delete(order); // 매도 주문 삭제
        await this.createTradeHistory(input, order); // 거래 내역 기록 (//TODO: 타입 추가)
        continue;
        // 매도 주문 수량 == 매수 주문 수량
      } else {
        await this.tradeRepository.delete(order); // 매도 주문 삭제
        await this.createTradeHistory(input, order); // 거래 내역 기록 (//TODO: 타입 추가)
        break;
      }
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

  private async createTradeHistory(input: TradeInput, order: Trade) {
  }
}
