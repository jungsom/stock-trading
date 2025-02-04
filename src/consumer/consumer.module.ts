import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Trade } from 'src/database/entity/trade.entity';
import { TradeHistory } from 'src/database/entity/tradeHistory.entity';
import { TradeModule } from 'src/trade/trade.module';
import { TradeService } from 'src/trade/trade.service';
import { Stock } from 'src/database/entity/stock.entity';
import {
  StockHistory,
  StockHistorySchema,
} from 'src/database/schema/stockHistory.schema';
import { TradeConsumer } from './trade.consumer';
import { ProducerModule } from 'src/producer/producer.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'trade-stock-queue',
    }),
    TypeOrmModule.forFeature([Trade, TradeHistory, Stock]),
    MongooseModule.forFeature([
      { name: StockHistory.name, schema: StockHistorySchema },
    ]),
    TradeModule,
    ProducerModule,
  ],
  providers: [TradeConsumer, TradeService, Logger],
  exports: [],
})
export class ConsumerModule {}
