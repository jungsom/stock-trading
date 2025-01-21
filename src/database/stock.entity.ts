import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Trade } from './trade.entity';
import { StockHistory } from './stockHistory.entity';

@Entity({ name: 'stock', schema: 'stock-trading' })
export class Stock extends BaseEntity {
  @Column({ unique: true, nullable: false, comment: '종목 코드' })
  code: string;

  @Column({ nullable: true, comment: '종목명' })
  name: string;

  @Column({ nullable: true, comment: '주가 지수' })
  index: string;

  @OneToMany(() => Trade, (trade) => trade.stock)
  trade: Trade[];

  @OneToMany(() => StockHistory, (stockHistory) => stockHistory.stock)
  stockHistory: StockHistory[];
}
