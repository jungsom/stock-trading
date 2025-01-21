import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from 'src/database/stock.entity';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
  ],
  providers: [StockService, Logger],
  controllers: [StockController],
  exports: [],
})
export class StockModule {}