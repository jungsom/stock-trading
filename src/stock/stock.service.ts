import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from 'src/database/stock.entity';
import { StockInput } from './dto/stock.dto';
import { StockHistory } from 'src/database/stockHistory.entity';
import { Trade } from 'src/database/trade.entity';
import { TradeInput } from 'src/trade/dto/trade.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockHistory)
    private readonly stockHistoryRepository: Repository<StockHistory>,
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
  ) {}

  /** 특정 주식 정보 조회 */
  async getStock(input: StockInput) {
    const stock = await this.stockHistoryRepository.findOne({
      where: { code: input.code },
    });

    return stock;
  }

  /** 현재 매도 호가에 따른 거래량 조회 */
  async getStockState(input: TradeInput) {
    const stockHistory = await this.tradeRepository
      .createQueryBuilder('trade')
      .select('*')
      .addSelect('SUM(stock.vulume)', 'totalVolumn')
      .groupBy('price');

    return stockHistory;
  }

  /** 거래 체결 시, 주식 가격 변경 */
  async changeStockPrice(input: TradeInput) {
    const stockHistory = await this.stockHistoryRepository.findOne({
      where: { code: input.code },
    });
    stockHistory.marketPrice = input.price;

    if (stockHistory.highPrice < input.price) {
      stockHistory.highPrice = input.price;
    }

    if (stockHistory.lowPrice > input.price) {
      stockHistory.lowPrice = input.price;
    }

    const result = await this.stockHistoryRepository.save(stockHistory);
    // this.eventGateway.broadCastStock(result);
    return result;
  }
}
