import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/entity/user.entity';
import { PayLoad } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService,
  ) {}

  /** 액세스 토큰 생성 */
  async createAccessToken(user: User): Promise<string> {
    const payload: PayLoad = { sub: user.id, user_email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return accessToken;
  }

  /** 리프레시 토큰 생성 */
  async createRefreshToken(user: User): Promise<string> {
    const payload: PayLoad = { sub: user.id, user_email: user.email };
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return refreshToken;
  }
}