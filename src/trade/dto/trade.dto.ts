import { TradeType } from 'src/database/trade.entity';

export class TradeInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;

  action?: string;
}

export class TradeOutput {
  success: boolean;
}
