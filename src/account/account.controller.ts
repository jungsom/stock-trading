import {
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthGuard } from 'src/auth/auth.guard';
import { AccountInput, AccountOutput } from './dto/account.dto';
import { AuthUser } from 'src/auth/auth.decorator';
import { User } from 'src/database/entity/user.entity';
import { uuid } from 'src/common/uuid';
import { AccountService } from './account.service';
import { BaseOutput } from 'src/common/dto/base.dto';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  /**
   * @function getCurrentAccount
   * @param {AccountInput} input
   * @return {Promise<AccountOutput>}
   * @description 계좌 조회
   */
  @UseGuards(AuthGuard)
  @Get()
  async getCurrentAccount(
    @AuthUser() user: User,
  ): Promise<AccountOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${AccountController.name} getCurrentAccount `,
      });

      const result = await this.accountService.getCurrentAccount(user);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${AccountController.name} getCurrentAccount `,
        error: e,
      });
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    } finally {
      this.logger.log({
        message: `[${transaction_id}] end `,
        context: `${AccountController.name} getCurrentAccount `,
      });
    }
  }

  /**
   * @function registerBank
   * @param {AccountInput} input
   * @return {Promise<AccountOutput>}
   * @description 계좌 등록
   */
  @UseGuards(AuthGuard)
  @Post()
  async registerBank(
    @Body() input: AccountInput,
    @AuthUser() user: User,
  ): Promise<AccountOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${AccountController.name} registerBank `,
      });

      const result = await this.accountService.registerBank(input, user);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${AccountController.name} registerBank `,
        error: e,
      });
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    } finally {
      this.logger.log({
        message: `[${transaction_id}] end `,
        context: `${AccountController.name} registerBank `,
      });
    }
  }

  /**
   * @function depositMoney
   * @param {AccountInput} input
   * @return {Promise<AccountOutput>}
   * @description 계좌 입금
   */
  @UseGuards(AuthGuard)
  @Put('/deposit')
  async depositMoney(
    @Body() input: AccountInput,
    @AuthUser() user: User,
  ): Promise<AccountOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${AccountController.name} registerBank `,
      });

      const result = await this.accountService.depositMoney(input, user);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${AccountController.name} registerBank `,
        error: e,
      });
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    } finally {
      this.logger.log({
        message: `[${transaction_id}] end `,
        context: `${AccountController.name} registerBank `,
      });
    }
  }

  /**
   * @function withdrawMoney
   * @param {AccountInput} input
   * @return {Promise<AccountOutput>}
   * @description 계좌 출금
   */
  @UseGuards(AuthGuard)
  @Put('/withdraw')
  async withdrawMoney(
    @Body() input: AccountInput,
    @AuthUser() user: User,
  ): Promise<AccountOutput> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${AccountController.name} registerBank `,
      });

      const result = await this.accountService.withdrawMoney(input, user);

      return result;
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${AccountController.name} registerBank `,
        error: e,
      });
      return {
        error: {
          code: e.status,
          message: e.message,
        },
      };
    } finally {
      this.logger.log({
        message: `[${transaction_id}] end `,
        context: `${AccountController.name} registerBank `,
      });
    }
  }
}
