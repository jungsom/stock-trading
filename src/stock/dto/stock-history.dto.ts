export class StockHistoryInput {
  code?: string;
}

export class StockHistoryOutput {
  code?: string;

  date?: Date;

  currentPrice?: number;

  openPrice?: number;

  closePrice?: number;

  highPrice?: number;

  lowPrice?: number;

  volume?: number;
}
