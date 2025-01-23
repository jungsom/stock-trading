import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockModule } from './stock/stock.module';
import { TradeModule } from './trade/trade.module';
import { BullModule } from '@nestjs/bull';
import { ConsumerModule } from './consumer/consumer.module';
import { ProducerModule } from './producer/producer.module';
import { EventGateway } from './event/event.gateway';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
        settings: { maxStalledCount: 100 }, // 재시도 횟수
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StockModule,
    TradeModule,
    ConsumerModule,
    ProducerModule,
  ],
  controllers: [],
  providers: [EventGateway],
})
export class AppModule {}
