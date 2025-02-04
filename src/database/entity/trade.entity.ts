import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Stock } from './stock.entity';

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Entity({ name: 'trade', schema: 'stock-trading' })
export class Trade extends BaseEntity {
  @Column({ nullable: false, comment: '매도량' })
  quantity: number;

  @Column({ nullable: true, comment: '매도가' })
  price: number;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  type: TradeType;

  @ManyToOne(() => Stock, (stock) => stock.trade)
  @JoinColumn({ name: 'stockCode', referencedColumnName: 'code' })
  stock: Stock;
}
