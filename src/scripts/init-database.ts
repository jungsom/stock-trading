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
  await stockRepository.save({ code: '005380', name: '현대차', index: '코스피', category: '자동차'});
  await stockRepository.save({ code: '000270', name: '기아차', index: '코스피', category: '자동차'});
  await stockRepository.save({ code: '051910', name: 'LG화학', index: '코스피', category: '화학'});
  await stockRepository.save({ code: '010950', name: 'S-Oil', index: '코스피', category: '석유화학'});
  await stockRepository.save({ code: '005490', name: 'POSCO', index: '코스피', category: '철강'});
  await stockRepository.save({ code: '000810', name: '삼성화재', index: '코스피', category: '보험'});
  await stockRepository.save({ code: '000030', name: '우리은행', index: '코스피', category: '은행'});
  await stockRepository.save({ code: '105560', name: 'KB금융', index: '코스피', category: '은행'});
  await stockRepository.save({ code: '139480', name: '이마트', index: '코스피', category: '유통'});
  await stockRepository.save({ code: '005610', name: 'SPC삼립', index: '코스피', category: '유통'});
  await stockRepository.save({ code: '000720', name: '현대건설', index: '코스피', category: '건설'});
  await stockRepository.save({ code: '002380', name: 'KCC', index: '코스피', category: '화학'});
  await stockRepository.save({ code: '009150', name: '삼성전기', index: '코스피', category: '전기/전자'});
  await stockRepository.save({ code: '000100', name: '유한양행', index: '코스피', category: '제약'});
  await stockRepository.save({ code: '004020', name: '현대제철', index: '코스피', category: '철강'});
  await stockRepository.save({ code: '004170', name: '신세계', index: '코스피', category: '유통'});
  await stockRepository.save({ code: '003490', name: '대한항공', index: '코스피', category: '항공'});
  await stockRepository.save({ code: '000120', name: 'CJ대한통운', index: '코스피', category: '운송'});
  await stockRepository.save({ code: '000240', name: '한국타이어', index: '코스피', category: '자동차'});
  await stockRepository.save({ code: '000060', name: '메리츠화재', index: '코스피', category: '보험'});
  await stockRepository.save({ code: '001040', name: 'CJ', index: '코스피', category: '유통'});
  await stockRepository.save({ code: '001120', name: 'LG상사', index: '코스피', category: '유통'});
  await stockRepository.save({ code: '000670', name: '영풍', index: '코스피', category: '유통'});
  await stockRepository.save({ code: '000150', name: '두산', index: '코스피', category: '건설'});
  await stockRepository.save({ code: '000210', name: '대림산업', index: '코스피', category: '건설'});
  
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
