import { Stock } from "src/database/entity/stock.entity";
import { TradeHistoryType } from "src/database/entity/tradeHistory.entity";

export class TradeHistoryInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeHistoryType;

  stockCode?: Stock;
}

export class TradeHistoryOutput {
  quantity: number;

  price: number;

  code: string;

  type: TradeHistoryType;

  createdAt: Date;

  updatedAt: Date;
}
