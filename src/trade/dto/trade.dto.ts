import { TradeType } from 'src/database/trade.entity';

export class TradeInput {
  quantity?: number;

  price?: number;

  code?: string;

  type?: TradeType;
}

export class TradeOutput {
  quantity?: number;

  price?: number;

  code?: string;
}
