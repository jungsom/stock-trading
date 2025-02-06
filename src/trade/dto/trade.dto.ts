import { BaseOutput } from 'src/common/dto/base.dto';
import { TradeType } from 'src/database/entity/trade.entity';

export class TradeInput {
  code?: string;

  quantity?: number;

  price?: number;

  type?: TradeType;
}

export class TradeOutput extends BaseOutput {
  quantity?: number;

  price?: number;

  code?: string;

  type?: TradeType;

  createdAt?: Date;

  updatedAt?: Date;
}
