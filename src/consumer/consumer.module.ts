import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Trade } from 'src/database/trade.entity';
import { TradeHistory } from 'src/database/tradeHistory.entity';
import { TradeModule } from 'src/trade/trade.module';
import { TradeService } from 'src/trade/trade.service';
import { Stock } from 'src/database/stock.entity';
import { StockHistory } from 'src/database/stockHistory.entity';
import { TradeConsumer } from './trade.consumer';
import { ProducerModule } from 'src/producer/producer.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'trade-stock-queue',
    }),
    TypeOrmModule.forFeature([Trade, TradeHistory, Stock, StockHistory]),
    TradeModule,
    ProducerModule
  ],
  providers: [TradeConsumer, TradeService, Logger],
  exports: [],
})
export class ConsumerModule {}
