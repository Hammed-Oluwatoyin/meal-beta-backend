import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Role } from '../common/enums';
import { User } from '../database/entities';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  static sanitize(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshTokenHash, verificationToken, ...safe } = user;
    return safe;
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TTL',
        ) as unknown as SignOptions['expiresIn'],
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TTL',
        ) as unknown as SignOptions['expiresIn'],
      },
    );
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.save(user);
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto, role: Role = Role.PATIENT) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    // No email provider is wired up yet, so the verification token is handed back
    // directly instead of being emailed, so /auth/verify-email is still reachable.
    const verificationToken = randomBytes(24).toString('hex');
    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      role,
      verificationToken,
      isVerified: role === Role.DIETITIAN || role === Role.ADMIN,
    });
    await this.usersRepository.save(user);
    return {
      user: AuthService.sanitize(user),
      verificationToken: user.isVerified ? null : verificationToken,
    };
  }

  async registerDietitian(dto: RegisterDto, actingUser: User) {
    if (actingUser.role !== Role.DIETITIAN && actingUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only dietitians or admins can invite dietitians',
      );
    }
    return this.register(dto, Role.DIETITIAN);
  }

  async registerAdmin(dto: RegisterDto, actingUser: User) {
    if (actingUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can invite other admins');
    }
    return this.register(dto, Role.ADMIN);
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }
    user.isVerified = true;
    user.verificationToken = null;
    await this.usersRepository.save(user);
    return { user: AuthService.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Account not verified');
    }
    const tokens = await this.issueTokens(user);
    return { user: AuthService.sanitize(user), ...tokens };
  }

  async refresh(user: User) {
    const tokens = await this.issueTokens(user);
    return { user: AuthService.sanitize(user), ...tokens };
  }

  async logout(userId: string) {
    await this.usersRepository.update(
      { id: userId },
      { refreshTokenHash: null },
    );
    return { success: true };
  }
}
