import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Stock } from './stock.entity';

@Entity({ name: 'stock-history', schema: 'stock-trading' })
export class StockHistory extends BaseEntity {
  @Column({ nullable: true, comment: '종목 코드' })
  code: string;
  
  @Column({ nullable: true, comment: '날짜' })
  date: Date;

  @Column({ nullable: true, comment: '시가' })
  marektPrice: number;

  @Column({ nullable: true, comment: '종가' })
  closePrice: number;

  @Column({ nullable: true, comment: '고가' })
  highPrice: number;

  @Column({ nullable: true, comment: '저가' })
  lowPrice: number;

  @Column({ nullable: true, comment: '거래량' })
  volume: number;

  @Column({ nullable: true, comment: '전날 종가 대비' })
  contrastPrice?: number;

  @Column({ nullable: true, comment: '등락률' })
  flucRate?: number;

  @Column({ nullable: true, comment: '시가총액' })
  marketCap?: number;

  @ManyToOne(() => Stock, (stock) => stock.stockHistory)
  stock: Stock;
}
