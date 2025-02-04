import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { Trade } from 'src/database/entity/trade.entity';
import { Stock } from 'src/database/entity/stock.entity';
import {
  StockHistory,
  StockHistorySchema,
} from 'src/database/schema/stockHistory.schema';
import { TradeHistory } from 'src/database/entity/tradeHistory.entity';
import { ProducerService } from 'src/producer/producer.service';
import { ProducerModule } from 'src/producer/producer.module';
import { StockService } from 'src/stock/stock.service';
import { EventGateway } from 'src/event/event.gateway';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trade, Stock, TradeHistory]),
    MongooseModule.forFeature([
      { name: StockHistory.name, schema: StockHistorySchema },
    ]),
    ProducerModule,
  ],
  providers: [
    TradeService,
    ProducerService,
    Logger,
    StockService,
    EventGateway,
  ],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
