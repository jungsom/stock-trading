import process from 'process';
import dotenv from 'dotenv';
import { Trade } from '../database/entity/trade.entity';
import { TradeHistory } from '../database/entity/tradeHistory.entity';
import { Stock } from '../database/entity/stock.entity';
import { DataSource } from 'typeorm';
import { User } from '../database/entity/user.entity';
import bcrypt from 'bcrypt';

require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Trade, TradeHistory, Stock, User],
  synchronize: true,
});

const tradeRepository = AppDataSource.getRepository(Trade);
const tradeHistoryRepository = AppDataSource.getRepository(TradeHistory);
const stockRepository = AppDataSource.getRepository(Stock);
const userRepository = AppDataSource.getRepository(User);

const onInitStock = async () => {
  await stockRepository.save({ code: '005930', name: '삼성전자', index: '코스피', category: '전기/전자' });
  await stockRepository.save({ code: '000660', name: 'SK하이닉스', index: '코스피', category: '전기/전자'});
  await stockRepository.save({ code: '066570', name: 'LG전자', index: '코스피', category: '전기/전자'});
};

const onInitUser = async () => {
  const password = await bcrypt.hash('1234', 10);
  await userRepository.save({ email: 'cat@naver.com', name: 'cat', password: password });
  await userRepository.save({ email: 'dog@gmail.com', name: 'dog', password: password });
  await userRepository.save({ email: 'tiger@kakao.com', name: 'tiger', password: password });
};


const onStart = async () => {
  await onInitStock();
  await onInitUser();
  console.log('Init Database Success');
};

AppDataSource.initialize()
  .then(() => onStart())
  .then(() => console.log('done'))
  .then(() => process.exit(0))
  .catch((e) => console.error(e));
