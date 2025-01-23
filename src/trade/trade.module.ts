import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { Trade } from 'src/database/trade.entity';
import { Stock } from 'src/database/stock.entity';
import { StockHistory } from 'src/database/stockHistory.entity';
import { TradeHistory } from 'src/database/tradeHistory.entity';
import { ProducerService } from 'src/producer/producer.service';
import { ProducerModule } from 'src/producer/producer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trade, Stock, StockHistory, TradeHistory]),
    ProducerModule,
  ],
  providers: [TradeService, ProducerService, Logger],
  controllers: [TradeController],
})
export class TradeModule {}
