import { Body, Controller, Post } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeInput, TradeOutput } from './dto/trade.dto';
import { ProducerService } from 'src/producer/producer.service';

@Controller('trade')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private readonly producerService: ProducerService,
  ) {}

  /**
   * @function postTrade
   * @param {TradeInput} input
   * @return {Promise<TradeOutput>}
   */
  @Post()
  postTrade(@Body() input: TradeInput): Promise<TradeOutput> {
    const result = this.producerService.onTradeStock(input);
    return result;
  }
}
