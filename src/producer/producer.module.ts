import { BullModule } from '@nestjs/bull';
import { Logger, Module } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'trade-stock-queue',
    }),
  ],
  providers: [ProducerService, Logger],
  exports: [ProducerService, BullModule],
})
export class ProducerModule {}
