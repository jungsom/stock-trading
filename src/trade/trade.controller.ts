import {
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
  Post,
  Query,
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
import { TradeHistoryOutput } from './dto/trade-history.dto';
import { TradeType } from 'src/database/entity/trade.entity';

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
   * @description 주식 매매
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

      // const currentPrice = await this.stockService.checkCurrentPrice(input);
      // await this.stockService.checkHighLowPrice(input);

      const stocks = await this.stockService.getStockHistory(input);
      await this.eventGateway.broadCastStock(stocks);
      await this.eventGateway.broadCastTrade(input);
      await this.eventGateway.broadCastTradeHistory(input);

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
   * @description 전체 호가 조회
   */
  @Get('/order/:code')
  async getAllTrades(
    @Param('code') code: string,
  ): Promise<TradeOutput[] | BaseOutput> {
    const transaction_id = uuid();
    const input: TradeOutput = { code };
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

  /**
   * @function getTradeHistory
   * @param {TradeInput} input
   * @return {Promise<TradeHistoryOutput[]>}
   * @description 전체 체결 내역 조회
   */
  @Get('history/:code')
  async getAllTradeHistorys(
    @Param('code') code: string,
  ): Promise<TradeHistoryOutput[] | BaseOutput> {
    const transaction_id = uuid();
    const input: TradeInput = { code };
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${TradeController.name} getTradeHistory `,
      });

      const result = this.tradeService.getAllTradeHistorys(input);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${TradeController.name} getTradeHistory `,
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
        context: `${TradeController.name} getTradeHistory `,
      });
    }
  }

  /**
   * @function getTradeHistory
   * @param {TradeInput} input
   * @return {Promise<TradeHistoryOutput[]>}
   * @description 사용자 체결 내역 조회
   */
  @Get('my/history')
  @UseGuards(AuthGuard)
  async getTradeHistoryByUser(
    @AuthUser() user: User,
    @Query('type') type: TradeType,
  ): Promise<TradeHistoryOutput[] | BaseOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${TradeController.name} getTradeHistoryByUser `,
      });

      if (type === TradeType.BUY) {
        return this.tradeService.getTradeHistoryBySeller(user);
      } else if (type === TradeType.SELL) {
        return this.tradeService.getTradeHistoryByBuyer(user);
      } else {
        throw new Error('주문 유형을 확인해주세요.');
      }

    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${TradeController.name} getTradeHistoryByUser `,
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
        context: `${TradeController.name} getTradeHistoryByUser `,
      });
    }
  }
}
