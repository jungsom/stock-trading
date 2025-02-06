import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from 'src/database/entity/stock.entity';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import {
  StockHistory,
  StockHistorySchema,
} from 'src/database/schema/stockHistory.schema';
import { Trade } from 'src/database/entity/trade.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, Trade]),
    MongooseModule.forFeature([
      { name: StockHistory.name, schema: StockHistorySchema },
    ]),
    AuthModule,
  ],

  providers: [StockService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
