import { Trade } from "src/database/trade.entity";
import { AppDataSource } from "./init-database";
import { Stock } from "src/database/stock.entity";
import { StockHistory } from "src/database/stockHistory.entity";
import axios from "axios";

const tradeRepository = AppDataSource.getRepository(Trade);
const stockRepository = AppDataSource.getRepository(Stock);
const stockHistoryRepository = AppDataSource.getRepository(StockHistory);

export const main = async () => {
    // 매수 예약 주문 
    const buyOrder = {
        input: {
            code: '000660',
            price: 90000,
            quantity: 10,
            type: 'SELL'
        }
    };
    const result = await axios.post('http://localhost:3000/trade', buyOrder);

    return result.data;
}

AppDataSource.initialize()
  .then(() => main())
  .then(() => console.log('done'))
  .then(() => process.exit(0))
  .catch((e) => console.error(e));
