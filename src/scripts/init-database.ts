import { Stock } from '../database/entity/stock.entity';
import { StockHistory } from '../database/schema/stockHistory.schema';
import { Trade, TradeType } from '../database/entity/trade.entity';
import { DataSource } from 'typeorm';

import config from 'config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.get<string>('DATABASE_HOST'),
  port: config.get<number>('DATABASE_PORT'),
  username: config.get<string>('DATABASE_USERNAME'),
  password: config.get<string>('DATABASE_PASSWORD'),
  database: config.get<string>('DATABASE_NAME'),
  entities: [Stock, Trade, StockHistory],
  synchronize: true,
});

const tradeRepository = AppDataSource.getRepository(Trade);
const stockRepository = AppDataSource.getRepository(Stock);

const stockHistoryRepository = AppDataSource.getRepository(StockHistory);

// 매수 주문 스크립트 (1000원대, 100원단위, 100개)
const buyOrders = async () => {
  for (let i = 0; i < 10; i++) {
    const trade = new Trade();
    trade.code = '005930';
    trade.quantity = Math.floor(Math.random() * 10 + 1) * 10; // 10 ~ 100 (10 단위)
    trade.price = Math.floor(Math.random() * 10 + 1) * 100; // 100 ~ 1000 (100 단위)
    trade.type = TradeType.BUY;
    await tradeRepository.save(trade);
  }
};

// 매도 주문 스크립트 (1000원대, 100원단위, 100개)
const sellOrders = async () => {
  for (let i = 0; i < 10; i++) {
    const trade = new Trade();
    trade.code = '005930';
    trade.quantity = Math.floor(Math.random() * 10 + 1) * 10; // 10 ~ 100 (10 단위)
    trade.price = Math.floor(Math.random() * 10 + 1) * 100; // 100 ~ 1000 (100 단위)
    trade.type = TradeType.SELL;
    await tradeRepository.save(trade);
  }
};

const onStart = async () => {
  await buyOrders();
  await sellOrders();
  console.log('Init Database Success');
};

AppDataSource.initialize()
  .then(() => onStart())
  .then(() => console.log('done'))
  .then(() => process.exit(0))
  .catch((e) => console.error(e));
