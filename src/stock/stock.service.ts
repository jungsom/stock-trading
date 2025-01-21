import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from 'src/database/stock.entity';
import { StockInput } from './dto/stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  /** 그날 주식 정보 조회 */
  async getStockInfo(input: StockInput) {
    // 시가, 고가, 저가, 종가, 전날종가대비, 등락율, 시가총액
    const stock = await this.stockRepository.findOne({
      where: { code: input.code },
    });

    return stock;
  }
}
