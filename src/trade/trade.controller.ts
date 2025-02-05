import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeInput, TradeOutput } from './dto/trade.dto';
import { ProducerService } from 'src/producer/producer.service';
import {
  onTradeStockInput,
  onTradeStockOutput,
} from './dto/on-trade-stock.dto';
import { StockService } from 'src/stock/stock.service';
import { EventGateway } from 'src/event/event.gateway';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth.decorator';
import { User } from 'src/database/entity/user.entity';

@Controller('trade')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private readonly stockService: StockService,
    private readonly producerService: ProducerService,
    private readonly eventGateway: EventGateway,
  ) {}

  /**
   * @function tradeStock
   * @param {onTradeStockInput} input
   * @return {Promise<onTradeStockOutput>}
   */
  @UseGuards(AuthGuard)
  @Post()
  async tradeStock(
    @Body() input: onTradeStockInput,
    @AuthUser() user: User,
  ): Promise<onTradeStockOutput> {
    const result = await this.producerService.onTradeStock(input, user);
    console.log('result', result);
    await this.stockService.checkCurrentPrice(input);
    await this.eventGateway.broadCastTrade(input);
    return result;
  }

  /**
   * @function getAllTrades
   * @param {TradeInput} input
   * @return {Promise<TradeOutput[]>}
   */
  @Get()
  async getAllTrades(@Body() input: TradeInput): Promise<TradeOutput[]> {
    const result = this.tradeService.getAllTrades(input);
    return result;
  }
}
