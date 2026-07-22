import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  private readonly OTP_LENGTH = 6;
  private readonly OTP_TTL_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_MINUTES = 15;
  private readonly MAX_PER_HOUR = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateOtp(userId: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: 'Usuario no encontrado' };

    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 60000);
      return { success: false, error: `Cuenta bloqueada. Intentá de nuevo en ${minutesLeft} min.` };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await this.prisma.user.count({
      where: {
        id: userId,
        lastOtpSentAt: { gte: oneHourAgo },
      },
    });
    if (recentOtps >= this.MAX_PER_HOUR) {
      return { success: false, error: 'Límite de códigos alcanzado. Esperá una hora.' };
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + this.OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: `${code}:${expiresAt.getTime()}`,
        lastOtpSentAt: new Date(),
        otpAttempts: 0,
        otpLockedUntil: null,
      },
    });

    const recipientEmail = user.notificationEmail || user.email;
    this.logger.log(`Enviando OTP a ${recipientEmail}`);

    const result = await this.emailService.sendOtpCode(
      recipientEmail,
      code,
      user.fullName,
    );

    this.logger.log(`OTP generado para ${user.email} (enviado a ${recipientEmail})`);
    return { success: true };
  }

  async verifyOtp(userId: string, code: string): Promise<{ valid: boolean; error?: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { valid: false, error: 'Usuario no encontrado' };

    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 60000);
      return { valid: false, error: `Cuenta bloqueada. Intentá en ${minutesLeft} min.` };
    }

    if (!user.twoFactorSecret || !user.twoFactorSecret.includes(':')) {
      return { valid: false, error: 'No hay código activo. Solicitá uno nuevo.' };
    }

    const [storedCode, expiresAtStr] = user.twoFactorSecret.split(':');
    const expiresAt = new Date(parseInt(expiresAtStr));

    if (expiresAt < new Date()) {
      return { valid: false, error: 'El código expiró. Solicitá uno nuevo.' };
    }

    if (code !== storedCode) {
      const attempts = user.otpAttempts + 1;
      const updateData: any = { otpAttempts: attempts };

      if (attempts >= this.MAX_ATTEMPTS) {
        updateData.otpLockedUntil = new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000);
        this.logger.warn(`OTP bloqueado para ${user.email} tras ${attempts} intentos`);
      }

      await this.prisma.user.update({ where: { id: userId }, data: updateData });
      return { valid: false, error: `Código incorrecto. ${this.MAX_ATTEMPTS - attempts} intentos restantes.` };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        otpAttempts: 0,
        otpLockedUntil: null,
      },
    });

    return { valid: true };
  }

  async isOtpLocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { otpLockedUntil: true },
    });
    return !!(user?.otpLockedUntil && user.otpLockedUntil > new Date());
  }
}
