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
import { User } from 'src/database/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { StockService } from 'src/stock/stock.service';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'trade-stock-queue',
    }),
    TypeOrmModule.forFeature([Trade, TradeHistory, Stock, User]),
    MongooseModule.forFeature([
      { name: StockHistory.name, schema: StockHistorySchema },
    ]),
    TradeModule,
    ProducerModule,
    AuthModule,
    StockModule
  ],
  providers: [TradeConsumer, TradeService, StockService, Logger],
  exports: [],
})
export class ConsumerModule {}
