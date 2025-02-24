import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Trade } from './trade.entity';
import { Account } from './account.entity';

@Entity({ name: 'user', schema: 'stock-trading' })
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(() => Trade, (trade) => trade.user)
  trade: Trade[];

  @OneToMany(() => Account, (account) => account.user)
  account: Account[];
}
