import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TradeService } from 'src/trade/trade.service';

@Processor('trade-stock-queue')
export class TradeConsumer {
  constructor(
    private readonly tradeService: TradeService,
  ) {}

  @Process()
  async handleTicket(job: Job) {
    try {
      const tradeResult = await this.tradeService.tradeStock(job.data);
      return tradeResult;
    } catch (e) {
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    }
  }
}
