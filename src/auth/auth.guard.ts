import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = this.extractAccessTokenFromHeader(request);
    const refreshToken = this.extractRefreshTokenFromCookie(request);

    // 액세스 X 혹은 리프레시 X
    if (!accessToken || !refreshToken) {
      throw new HttpException(
        '인증 토큰이 필요합니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // 액세스 인증 성공
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.SECRET_KEY,
      });

      const user = await this.userService.selectUser(payload.sub);
      request['user'] = user;

      return true;
    } catch (error) {
      // 액세스 인증 실패 시,
      // 액세스 O, 리프레시 O
      try {
        const newPayload = await this.jwtService.verifyAsync(refreshToken, {
          secret: process.env.SECRET_KEY,
        });
        const newAccessToken =
          await this.authService.createAccessToken(newPayload);
        response.setHeader(`Authorization`, `Bearer ${newAccessToken}`);

        const user = await this.userService.selectUser(newPayload.sub);
        request['user'] = user;

        return true;
        // 액세스 O, 리프레시 O
      } catch (error) {
        throw new HttpException(
          '인증에 실패하였습니다. 다시 로그인해 주세요.',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  /** 헤더에서 액세스 토큰 추출 */
  private extractAccessTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /** 쿠키에서 리프레시 토큰 추출 */
  private extractRefreshTokenFromCookie(request: Request): string | undefined {
    const refreshToken = request.cookies['x-refresh-token'];
    return refreshToken;
  }
}
