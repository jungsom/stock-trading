import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'account', schema: 'stock-trading' })
export class Account extends BaseEntity {
  @Column({ nullable: false, name:"bank_number" })
  bankNumber: string;

  @Column({ nullable: false, name:"bank_name" })
  bankName: string;

  @Column({ nullable: true, default: 0})
  balance: number;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.trade)
  @JoinColumn({ name: 'user', referencedColumnName: 'id' })
  user: User;
}
