import { UserInput, UserOutPut } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import {
  Body,
  Controller,
  Inject,
  Logger,
  LoggerService,
  Post,
  Res,
} from '@nestjs/common';
import { uuid } from 'src/common/uuid';
import { UserService } from './user.service';
import { Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { User } from 'src/database/entity/user.entity';

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  /**
   * @function signup
   * @param {UserInput} input
   * @return {Promise<UserOutPut>}
   */
  @Post('signup')
  async signup(@Body() input: UserInput): Promise<UserOutPut> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${UserController.name} signup `,
      });

      await this.userService.validateSignupUser(input);
      await this.userService.createUser(input);

      return { isSuccessful: true };
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${UserController.name} signup `,
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
        context: `${UserController.name} signup `,
      });
    }
  }

  /**
   * @function login
   * @param {UserInput} input
   * @return {Promise<UserOutPut>}
   */
  @Post('login')
  async login(
    @Body() input: UserInput,
    @Res() res: Response,
  ): Promise<UserOutPut> {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${UserController.name} login `,
      });

      const user = await this.userService.validateLoginUser(input);

      const accessToken = await this.authService.createAccessToken(user);
      const refreshToken = await this.authService.createRefreshToken(user);

      res.setHeader(`Authorization`, `Bearer ${accessToken}`);
      res.cookie('x-refresh-token', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.json({ isSuccessful: true });
    } catch (e) {
      this.logger.error({
        message: `[${transaction_id}] fail `,
        context: `${UserController.name} login `,
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
        context: `${UserController.name} login `,
      });
    }
  }
}
