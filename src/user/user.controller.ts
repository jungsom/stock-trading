import { UserInput, UserOutPut } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { uuid } from 'src/common/uuid';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  @Post('signup')
  async signup(@Body() input: UserInput) {
    const transaction_id = uuid();
    try {
      this.logger.log({
        message: `[${transaction_id}] start `,
        context: `${UserController.name} signup `,
      });

      await this.userService.validateSignupUser(input);
      return await this.userService.createUser(input);
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

  @Post('login')
  async login(@Body() input: UserInput, @Res() res: Response) {
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
      return res.status(200).json({ user });
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
