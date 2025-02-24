import { BaseOutput } from 'src/common/dto/base.dto';

export class AccountInput {
  bankNumber?: string;

  bankName?: string;

  balance?: number;

  userId?: number;
}

export class AccountOutput extends BaseOutput {
  bankNumber?: string;

  bankName?: string;

  balance?: number;

  userId?: number;
}
