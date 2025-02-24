import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountInput } from './dto/account.dto';
import { Repository } from 'typeorm';
import { Account } from 'src/database/entity/account.entity';
import { User } from 'src/database/entity/user.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async registerBank(input: AccountInput, user: User) {
    const newAccount = { ...input, userId: user.id, user: user };

    return await this.accountRepository.save(newAccount);
  }

  async depositMoney(input: AccountInput, user: User) {
    const existingMoney = await this.accountRepository.findOne({
      where: {
        bankNumber: input.bankNumber,
        bankName: input.bankName,
        userId: user.id,
      },
    });

    existingMoney.balance += input.balance

    return await this.accountRepository.save(existingMoney);
  }

  async withdrawMoney(input: AccountInput, user: User) {
    const existingMoney = await this.accountRepository.findOne({
      where: {
        bankNumber: input.bankNumber,
        bankName: input.bankName,
        userId: user.id,
      },
    });

    existingMoney.balance -= input.balance

    return await this.accountRepository.save(existingMoney);
  }
}
