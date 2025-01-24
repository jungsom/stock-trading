import { TradeType } from 'src/database/trade.entity';

export class onTradeStockInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;
}

export class onTradeStockOutput {
  isSuccess?: boolean;
}
