import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradeInput } from './dto/trade.dto';
import { Stock } from 'src/database/stock.entity';
import { Trade } from 'src/database/trade.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async buyStock(input: TradeInput) {
    const stock = await this.stockRepository.findOne({
      where: { code: input.code },
    });
    await this.checkMinSellPrice(stock, input.price);

    return stock;
    // 매도 예약 db에 원하는 매수가가 있을 경우) 매수-매도 거래 체결
    // 원하는 매수가가 없을 경우 ) 매수가 저장 (매도에 새로운 데이터가 올라올때까지 기다림)
    // return await this.buyRepository.save(input);
  }

  async sellStock(input: TradeInput) {
    // 매수 예약 db에 원하는 매도가가 있을 경우) 매수-매도 거래 체결
    // 그 외) 매도가 저장
    // return await this.sellRepository.save(input);

    const stock = await this.stockRepository.findOne({
        where: { code: input.code },
      });
      await this.checkMinSellPrice(stock, input.price);
  
      return stock;
  }

  async checkMinSellPrice(stock: Stock, buyPrice: number) {
    // if (stock.= > buyPrice) {
    //     stock.price = buyPrice;
    //     return await this.buyRepository.save(stock);
  }
}
