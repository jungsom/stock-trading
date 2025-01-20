import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Stock } from './stock.entity';

@Entity()
export class Sell extends BaseEntity {
  @Column({ nullable: false, comment: '매도량' })
  quantity: number;

  @Column({ nullable: true, comment: '매도가' })
  price: number;

  @Column({ nullable: true })
  code: Stock;

  @ManyToOne(() => Stock, (stock) => stock.purchase)
  @JoinColumn({ name: 'stockCode', referencedColumnName: 'code' })
  stock: Stock;
}
