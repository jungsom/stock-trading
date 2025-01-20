import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Purchase } from './purchase.entity';
import { Sell } from './sell.entity';

@Entity()
export class Stock extends BaseEntity {
  @Column({ unique: true, nullable: false, comment: '종목 코드' })
  code: string;

  @Column({ nullable: false, comment: '종목명' })
  name: string;

  @Column({ nullable: true, comment: '주가 지수' })
  index: string;

  @OneToMany(() => Purchase, (purchase) => purchase.stock)
  purchase: Purchase[];

  @OneToMany(() => Sell, (sell) => sell.stock)
  sell: Sell[];
}
