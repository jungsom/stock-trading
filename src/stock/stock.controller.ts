import {
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { StockInput, StockOutput } from './dto/stock.dto';
import { StockHistoryInput, StockHistoryOutput } from './dto/stock-history.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { uuid } from 'src/common/uuid';
import { BaseOutput } from 'src/common/dto/base.dto';

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  /**
   * @function getAllStock
   * @return {Promise<StockOutput[]>}
   */
  @Get()
  async getAllStocks(): Promise<StockOutput[] | BaseOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${StockController.name} getAllStocks `,
      });

      return await this.stockService.getAllStocks();
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${StockController.name} getAllStocks `,
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
        context: `${StockController.name} getAllStocks `,
      });
    }
  }

  /**
   * @function getStockInfo
   * @param {StockInput} input
   * @return {Promise<StockOutput>}
   */
  @Get(':code')
  async getStock(@Param('code') code: string): Promise<StockOutput> {
    const transaction_id = uuid();
    const input: StockInput = { code };
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${StockController.name} getStock `,
      });

      return await this.stockService.getStock(input);
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${StockController.name} getStock `,
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
        context: `${StockController.name} getStock `,
      });
    }
  }

  /**
   * @function getStockPrice
   * @param {StockHistoryInput} input
   * @return {Promise<StockHistoryOutput>}
   */
  @Get('price/:code')
  async getStockPrice(
    @Param('code') code: string,
  ): Promise<StockHistoryOutput> {
    const transaction_id = uuid();
    const input: StockHistoryInput = { code };
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${StockController.name} getStockPrice `,
      });

      return await this.stockService.getStockHistory(input);
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${StockController.name} getStockPrice `,
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
        context: `${StockController.name} getStockPrice `,
      });
    }
  }
}
