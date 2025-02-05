import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { User } from 'src/database/entity/user.entity';
import { TradeService } from 'src/trade/trade.service';
import { Repository } from 'typeorm';

@Processor('trade-stock-queue')
export class TradeConsumer {
  constructor(
    private readonly tradeService: TradeService,
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>, 
  ) {}

  @Process()
  async handleTicket(job: Job) {
    try {
      const user = await this.userRepository.findOne({ where: { id: job.data.userId } });
      const tradeResult = await this.tradeService.tradeStock(job.data, user);
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
