import { BaseOutput } from "src/common/dto/base.dto";

export class StockHistoryInput {
  code?: string;
}

export class StockHistoryOutput extends BaseOutput {
  code?: string;

  date?: Date;

  currentPrice?: number;

  openPrice?: number;

  closePrice?: number;

  highPrice?: number;

  lowPrice?: number;

  volume?: number;
}
