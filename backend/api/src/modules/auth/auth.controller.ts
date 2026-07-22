import { Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { IsString, MinLength, IsEmail } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OtpService } from '../notifications/email/otp.service';

class LoginDto {
  @IsString()
  @MinLength(3)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class VerifyOtpDto {
  @IsString()
  token: string;

  @IsString()
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.twoFactorEnabled) {
      const tempToken = this.authService.generateTempToken(user.id);
      return {
        requiresOtp: true,
        tempToken,
        email: user.email,
      };
    }

    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.fullName);
  }

  @Post('2fa/verify-login')
  async verifyLoginOtp(@Body() body: VerifyOtpDto) {
    const payload = this.authService.verifyTempToken(body.token);
    if (!payload) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const result = await this.otpService.verifyOtp(payload.sub, body.code);
    if (!result.valid) {
      throw new UnauthorizedException(result.error || 'Código inválido');
    }

    const user = await this.authService.validateJwtPayload({ sub: payload.sub });
    return this.authService.login(user);
  }

  @Post('2fa/send-otp')
  @UseGuards(JwtAuthGuard)
  async sendOtp(@Request() req: { user: any }) {
    return this.otpService.generateOtp(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: { user: any }) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role?.name || user.role,
      companyId: (user.role?.permissions as any)?.companyId,
      twoFactorEnabled: user.twoFactorEnabled || false,
    };
  }
}
