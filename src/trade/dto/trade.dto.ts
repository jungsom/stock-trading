import { TradeType } from 'src/database/trade.entity';

export class TradeInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;
}

export class TradeOutput {
  isSuccess?: boolean;
}
