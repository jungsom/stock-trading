import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Stock } from './stock.entity';
import { User } from './user.entity';

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
  type: TradeType;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.trade)
  @JoinColumn({ name: 'user', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Stock, (stock) => stock.trade)
  @JoinColumn({ name: 'stock', referencedColumnName: 'code' })
  stock: Stock;
}
