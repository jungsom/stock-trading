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
    private readonly tradeRepository: Repository<Trade>
  ) {}

  // 그날 주식 정보 조회
  async getStockInfo(input: StockInput) {
    // 시가, 고가, 저가, 종가, 전날종가대비, 등락율, 시가총액
    const stock = await this.stockRepository.findOne({
      where: { code: input.code },
    });

    return stock;
  }

  // 현재 매도 호가에 따른 거래량 조회
  async getStockState(input: TradeInput) {
    const stockHistory = await this.tradeRepository.createQueryBuilder('trade')
    .select('*')
    .addSelect('SUM(stock.vulume)', 'totalVolumn')
    .groupBy('price')
  }
}
