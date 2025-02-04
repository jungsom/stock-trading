import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Stock } from './stock.entity';
import { BaseEntity } from './base.entity';

export enum TradeHistoryType {
  ALL_TRADE = 'ALL_TRADE',
  SPLIT_TRADE = 'SPLIT_TRADE',
}

@Entity({ name: 'trade-history', schema: 'stock-trading' })
export class TradeHistory extends BaseEntity {
  @Column({ nullable: false, comment: '매도량' })
  quantity: number;

  @Column({ nullable: true, comment: '매도가' })
  price: number;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  type: TradeHistoryType;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Stock, (stock) => stock.trade)
  @JoinColumn({ name: 'stockCode', referencedColumnName: 'code' })
  stock: Stock;
}
