import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { Trade } from 'src/database/trade.entity';
import { Stock } from 'src/database/stock.entity';
import { StockHistory } from 'src/database/stockHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, Stock, StockHistory])],
  providers: [TradeService, Logger],
  controllers: [TradeController],
  exports: [],
})
export class TradeModule {}
