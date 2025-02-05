import { Stock } from "src/database/entity/stock.entity";
import { TradeHistoryType } from "src/database/entity/tradeHistory.entity";

export class TradeHistoryInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeHistoryType;

  seller?: number;

  buyer?: number;

  stock?: Stock;
}

export class TradeHistoryOutput {
  quantity: number;

  price: number;

  code: string;

  type: TradeHistoryType;

  seller: number;

  buyer: number;

  createdAt: Date;
}
