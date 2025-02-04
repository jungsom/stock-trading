import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from 'src/database/entity/stock.entity';
import { StockInput } from './dto/stock.dto';
import {
  StockHistory,
  StockHistoryDocument,
} from 'src/database/schema/stockHistory.schema';
import { Trade } from 'src/database/entity/trade.entity';
import { TradeInput } from 'src/trade/dto/trade.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { onTradeStockInput } from 'src/trade/dto/on-trade-stock.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectModel(StockHistory.name)
    private readonly stockHistoryModel: Model<StockHistoryDocument>,
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /** 특정 주식 정보 조회 */
  async getStock(input: StockInput) {
    const cacheKey = `stock_${input.code}`; // 주식 코드별 KEY
    const cachedStock = await this.cacheManager.get(cacheKey);

    if (cachedStock) {
      return cachedStock;
    }

    const newStock = await this.stockHistoryModel
      .findOne({
        where: { code: input.code },
      })
      .sort({ createdAt: -1 });

    await this.cacheManager.set(cacheKey, newStock);

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

  /** 거래 체결 시, 주식 가격 변경 */
  async changeStockPrice(input: onTradeStockInput) {
    const stockHistory = await this.stockHistoryModel
      .findOne({ code: input.code })
      .sort({ createdAt: -1 });

    let isChanged = false;
    const updateData: Partial<StockHistory> = {};

    if (stockHistory.marketPrice !== input.price) {
      stockHistory.marketPrice = input.price;
      isChanged = true;
    }

    if (stockHistory.highPrice < input.price) {
      stockHistory.highPrice = input.price;
      isChanged = true;
    }

    if (stockHistory.lowPrice > input.price) {
      stockHistory.lowPrice = input.price;
      isChanged = true;
    }

    if (isChanged) {
      const result = await this.stockHistoryModel.findOneAndUpdate(
        { _id: stockHistory._id },
        { $set: updateData },
        { new: true },
      );

      return result;
    } else {
      return null;
    }
  }

  // renew storyHistory cycle: 1 minute
  @Cron('45 * * * * *')
  async createStockHistory() {
    const lastStockHistory = await this.stockHistoryModel
      .findOne()
      .sort({ createdAt: -1 });

    if (lastStockHistory) {
      const newStockHistory = new this.stockHistoryModel({
        code: lastStockHistory.code,
        currentPrice: lastStockHistory.currentPrice,
        marketPrice: lastStockHistory.marketPrice,
        closePrice: lastStockHistory.closePrice,
        highPrice: lastStockHistory.highPrice,
        lowPrice: lastStockHistory.lowPrice,
        date: new Date(),
      });
      await newStockHistory.save();
    }
  }
}
