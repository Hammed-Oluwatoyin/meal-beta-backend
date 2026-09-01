import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/decorators';
import { JwtAuthGuard, JwtRefreshGuard, RolesGuard } from '../common/guards';
import { Role } from '../common/enums';
import { User } from '../database/entities';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-dietitian')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DIETITIAN, Role.ADMIN)
  @ApiBearerAuth()
  registerDietitian(@Body() dto: RegisterDto, @CurrentUser() user: User) {
    return this.authService.registerDietitian(dto, user);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  registerAdmin(@Body() dto: RegisterDto, @CurrentUser() user: User) {
    return this.authService.registerAdmin(dto, user);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  refresh(@CurrentUser() user: User) {
    return this.authService.refresh(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: User) {
    return AuthService.sanitize(user);
  }
}
