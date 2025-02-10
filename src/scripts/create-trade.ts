import dotenv from 'dotenv';

dotenv.config({
  path: './.env',
});
import process from 'process';
import { Trade } from '../database/entity/trade.entity';
import { TradeHistory } from '../database/entity/tradeHistory.entity';
import { Stock } from '../database/entity/stock.entity';
import { DataSource } from 'typeorm';
import { User } from '../database/entity/user.entity';
import axios from 'axios';
import { Head } from '@nestjs/common';

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

let userToken = [];

const getToken = async () => {
  const users = [
    { email: 'cat@naver.com', password: '1234' },
    { email: 'dog@gmail.com', password: '1234' },
    { email: 'tiger@kakao.com', password: '1234' },
  ];

  try {
    const loginRequests = users.map(async (user) => {
      const result = await axios.post(
        `${process.env.SERVER_URL}/user/login`,
        user,
      );

      const accessToken = result.headers.authorization;
      const refreshToken = result.headers['set-cookie'];

      userToken.push({ accessToken, refreshToken });
    });

    await Promise.all(loginRequests);
    console.log('✅Login Success: ', userToken);
  } catch (e) {
    console.error('❌Login Failed: ', e.message);
  }
};

const onCreateTrade = async () => {
  const trades = [
    { code: '005930', price: 1000, quantity: 10, type: 'BUY' }, 
    { code: '005930', price: 1200, quantity: 5, type: 'BUY' }, 
    { code: '005930', price: 1100, quantity: 20, type: 'SELL' }, 
    { code: '005930', price: 1100, quantity: 10, type: 'SELL' },
    { code: '005930', price: 1300, quantity: 5, type: 'SELL' },
    { code: '005930', price: 1200, quantity: 20, type: 'BUY' },
    { code: '005930', price: 1000, quantity: 10, type: 'BUY' }, 
    { code: '005930', price: 1200, quantity: 5, type: 'BUY' }, 
    { code: '005930', price: 1000, quantity: 20, type: 'SELL' }, 
    { code: '005930', price: 1300, quantity: 10, type: 'SELL' },
  ];

  try {
    const tradeRequests = trades.map(async (trade, index) => {
      const userIndex = index % userToken.length;
      const result = await axios.post(
        `${process.env.SERVER_URL}/trade`,
        trade,
        {
          headers: {
            Authorization: userToken[userIndex].accessToken,
            Cookie: userToken[userIndex].refreshToken[0],
          },
        },
      );

      return result.data;
    });

    const result = await Promise.all(tradeRequests);
    console.log('✅Trade Success: ', result);
  } catch (e) {
    console.error('❌Trade Failed: ', e.message);
  }
};

const onStart = async () => {
  await getToken();
  await onCreateTrade();
  console.log('User Create Success');
};

AppDataSource.initialize()
  .then(() => onStart())
  .then(() => console.log('done'))
  .then(() => process.exit(0))
  .catch((e) => console.error(e));
