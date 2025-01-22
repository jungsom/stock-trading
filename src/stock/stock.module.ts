import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from 'src/database/stock.entity';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockHistory } from 'src/database/stockHistory.entity';
import { Trade } from 'src/database/trade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockHistory, Trade]),
  ],
  providers: [StockService, Logger],
  controllers: [StockController],
  exports: [],
})
export class StockModule {}