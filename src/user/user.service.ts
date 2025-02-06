import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { Repository } from 'typeorm';
import { UserInput, UserOutPut } from 'src/user/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** 사용자 회원가입 */
  async createUser(input: UserInput) {
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = { ...input, password: hashedPassword };

    return await this.userRepository.save(user);
  }

  /** 사용자 정보 조회 */
  async selectUser(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  /** 사용자 회원가입 정보 확인 */
  async validateSignupUser(input: UserInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (user) {
      throw new HttpException(
        '이미 가입된 회원입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /** 사용자 로그인 정보 확인 */
  async validateLoginUser(input: UserInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    const verifyPassword = await bcrypt.compare(input.password, user.password);

    if (!user || !verifyPassword) {
      throw new HttpException(
        '로그인 인증에 실패하였습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
