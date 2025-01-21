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
  async getStockInfo(@Body() input: StockInput): Promise<StockOutput> {
    console.log('input :', input);
    return await this.stockService.getStockInfo(input);
  }
}
