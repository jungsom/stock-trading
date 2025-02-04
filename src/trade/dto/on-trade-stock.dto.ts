import { BaseEntity } from 'src/database/entity/base.entity';
import { TradeType } from 'src/database/entity/tradeHistory.entity';

export class onTradeStockInput extends BaseEntity {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;
}

export class onTradeStockOutput {
  isSuccess?: boolean;
}
