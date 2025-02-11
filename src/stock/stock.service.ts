import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from 'src/database/entity/stock.entity';
import { StockHistory } from 'src/database/schema/stockHistory.schema';
import { Trade, TradeType } from 'src/database/entity/trade.entity';
import { TradeInput } from 'src/trade/dto/trade.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import { StockHistoryInput } from './dto/stock-history.dto';
import { StockInput } from './dto/stock.dto';
import { TradeHistory } from 'src/database/entity/tradeHistory.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectModel(StockHistory.name)
    private readonly stockHistoryModel: Model<StockHistory>,
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(TradeHistory)
    private readonly tradeHistoryRepository: Repository<TradeHistory>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /** 전체 주식 정보 조회 */
  async getAllStocks() {
    const stocks = await this.stockRepository.find();
    const result = await Promise.all(
      stocks.map(async (stock) => {
        const latestHistory = await this.stockHistoryModel
          .findOne({ code: stock.code })
          .sort({ createdAt: -1 });

        return {
          ...stock,
          latestHistory,
        };
      }), 
    )
    console.log(result);

    return result;
  }

  /** 특정 주식 정보 조회 */
  async getStock(input: StockInput) {
    const cacheKey = `stock_${input.code}`; // 주식 코드별 KEY
    const cachedStock = await this.cacheManager.get(cacheKey);

    if (cachedStock) {
      return cachedStock;
    }

    const newStock = await this.stockRepository.findOne({
      where: { code: input.code },
    });

    await this.cacheManager.set(cacheKey, newStock);

    return newStock;
  }

  /** 특정 주식 가격 조회 */
  async getStockHistory(input: StockHistoryInput) {
    const newStock = await this.stockHistoryModel
      .findOne({ code: input.code })
      .sort({ createdAt: -1 });

    return newStock;
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

  /** 시장가 체크 */
  async checkCurrentPrice(input: TradeInput) {
    const lowestSellOrder = await this.tradeRepository.findOne({
      where: { code: input.code, type: TradeType.SELL },
      order: { price: 'ASC' },
    });

    const currentStockHistory = await this.stockHistoryModel
      .findOne({
        code: input.code,
      })
      .sort({ createdAt: -1 });

    if (
      lowestSellOrder &&
      lowestSellOrder.price !== currentStockHistory.currentPrice
    ) {
      currentStockHistory.currentPrice = lowestSellOrder.price;
      console.log('시장가가 변동되었습니다.');
      await currentStockHistory.save();
    }
  }

  /** 고가, 저가 체크  */
  async checkHighLowPrice(input: TradeInput) {
    const lowestTradePrice = await this.tradeHistoryRepository.findOne({
      where: { code: input.code },
      order: { price: 'ASC' },
    });
    const highestTraderPrice = await this.tradeHistoryRepository.findOne({
      where: { code: input.code },
      order: { price: 'DESC' },
    });

    const currentStockHistory = await this.stockHistoryModel
      .findOne({
        code: input.code,
      })
      .sort({ createdAt: -1 });

    if (lowestTradePrice.price > currentStockHistory.highPrice) {
      currentStockHistory.highPrice = input.price;
    }

    if (highestTraderPrice.price < currentStockHistory.lowPrice) {
      currentStockHistory.lowPrice = input.price;
    }

    await currentStockHistory.save();
  }

  /** TODO: 거래량 업데이트 */

  /** TODO: 시가, 종가 체크 */

  /** 주식 가격 업데이트 (주기 : 1분마다) */
  @Cron('45 * * * * *', { timeZone: 'Asia/Seoul' })
  async createStockHistory() {
    const lastStockHistory = await this.stockHistoryModel
      .findOne()
      .sort({ createdAt: -1 });

    if (lastStockHistory) {
      const newStockHistory = new this.stockHistoryModel({
        code: lastStockHistory.code,
        currentPrice: lastStockHistory.currentPrice,
        openPrice: lastStockHistory.openPrice,
        closePrice: lastStockHistory.closePrice,
        highPrice: lastStockHistory.highPrice,
        lowPrice: lastStockHistory.lowPrice,
        date: new Date(),
      });
      await newStockHistory.save();
    }
  }
}
