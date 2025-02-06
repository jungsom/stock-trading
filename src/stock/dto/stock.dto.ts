import { BaseOutput } from "src/common/dto/base.dto";

export class StockInput {
  code?: string;

  name?: string;
}

export class StockOutput extends BaseOutput {
  code?: string;

  name?: string;

  index?: string;
}
