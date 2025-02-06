import {
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { uuid } from 'src/common/uuid';
import { BaseOutput } from 'src/common/dto/base.dto';

@Controller('trade')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private readonly stockService: StockService,
    private readonly producerService: ProducerService,
    private readonly eventGateway: EventGateway,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
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
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${TradeController.name} tradeStock `,
      });

      const result = await this.producerService.onTradeStock(input, user);
      await this.stockService.checkCurrentPrice(input);
      await this.eventGateway.broadCastTrade(input);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${TradeController.name} tradeStock `,
        error: e,
      });
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    } finally {
      this.logger.log({
        message: `[${transaction_id}] end `,
        context: `${TradeController.name} tradeStock `,
      });
    }
  }

  /**
   * @function getAllTrades
   * @param {TradeInput} input
   * @return {Promise<TradeOutput[]>}
   */
  @Get()
  async getAllTrades(@Body() input: TradeInput): Promise<TradeOutput[] | BaseOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${TradeController.name} getAllTrades `,
      });

      const result = this.tradeService.getAllTrades(input);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${TradeController.name} getAllTrades `,
        error: e,
      });
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    } finally {
      this.logger.log({
        message: `[${transaction_id}] end `,
        context: `${TradeController.name} getAllTrades `,
      });
    }
  }
}
