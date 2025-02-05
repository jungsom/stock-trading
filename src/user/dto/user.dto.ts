import { BaseOutput } from 'src/common/dto/base.dto';

export class UserInput {
  email?: string;

  password?: string;

  name?: string;
}

export class UserOutPut extends BaseOutput {
  id?: number;

  email?: string;

  name?: string;
}