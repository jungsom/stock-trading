import { BullModule } from '@nestjs/bull';
import { Logger, Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'trade-stock-queue',
    }),
    AuthModule,
  ],
  providers: [ProducerService, Logger],
  exports: [ProducerService, BullModule],
})
export class ProducerModule {}
