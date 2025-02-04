import { TradeType } from 'src/database/entity/trade.entity';

export class TradeInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;
}

export class TradeOutput {
  quantity: number;

  price: number;

  code: string;

  type: TradeType;

  createdAt: Date;

  updatedAt: Date;
}
