import { Body, Controller, Get, Post } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockInput, StockOutput } from './dto/stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * @function getStockInfo
   * @param {StockInput} input
   * @return {Promise<StockOutput>}
   */
  @Get()
  async getStock(@Body() input: StockInput): Promise<StockOutput> {
    return await this.stockService.getStock(input);
  }
}
