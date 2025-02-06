import { BaseOutput } from 'src/common/dto/base.dto';
import { TradeType } from 'src/database/entity/trade.entity';

export class onTradeStockInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;
}

export class onTradeStockOutput extends BaseOutput {
  isSuccess?: boolean;
  message?: string;
}
