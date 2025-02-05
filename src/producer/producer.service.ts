import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { User } from 'src/database/entity/user.entity';
import {
  onTradeStockInput,
  onTradeStockOutput,
} from 'src/trade/dto/on-trade-stock.dto';

@Injectable()
export class ProducerService {
  constructor(
    @InjectQueue('trade-stock-queue') private readonly tradeStockQueue: Queue,
  ) {}

  async onTradeStock(
    input: onTradeStockInput,
    user: User,
  ): Promise<onTradeStockOutput> {
    const job = await this.tradeStockQueue.add(
      { ...input, userId: user.id },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    const result = await job.finished();
    return result ?? { isSuccess: true, message: '거래가 성공하였습니다.' };
  }
}
