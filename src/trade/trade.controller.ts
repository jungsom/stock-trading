import { Body, Controller, Get, Post } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeInput, TradeOutput } from './dto/trade.dto';
import { ProducerService } from 'src/producer/producer.service';
import {
  onTradeStockInput,
  onTradeStockOutput,
} from './dto/on-trade-stock.dto';
import { StockService } from 'src/stock/stock.service';

@Controller('trade')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private readonly stockService: StockService,
    private readonly producerService: ProducerService,
  ) {}

  /**
   * @function postTrade
   * @param {onTradeStockInput} input
   * @return {Promise<onTradeStockOutput>}
   */
  @Post()
  async postTrade(
    @Body() input: onTradeStockInput,
  ): Promise<onTradeStockOutput> {
    const result = this.producerService.onTradeStock(input);
    await this.stockService.changeStockPrice(input);
    return result;
  }

  /**
   * @function getAllTrades
   * @param {TradeInput} input
   * @return {Promise<Trade[]>}
   */
  @Get()
  async getAllTrades(@Body() input: TradeInput): Promise<TradeOutput[]> {
    const result = this.tradeService.getAllTrades(input);
    return result;
  }
}
