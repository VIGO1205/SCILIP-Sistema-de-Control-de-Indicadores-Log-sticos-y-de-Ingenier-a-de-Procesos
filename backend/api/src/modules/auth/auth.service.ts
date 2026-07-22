import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<(User & { role: Role }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true },
    });
    if (!user?.isActive) {
      return null;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return null;
    }
    return user;
  }

  login(user: User & { role: Role }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      companyId: user.companyId || null,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        notificationEmail: user.notificationEmail,
        fullName: user.fullName,
        role: user.role.name,
        companyId: user.companyId || null,
      },
    };
  }

  generateTempToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'otp_verify' },
      { expiresIn: '5m' },
    );
  }

  verifyTempToken(token: string): { sub: string } | null {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'otp_verify') return null;
      return payload;
    } catch {
      return null;
    }
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    companyName?: string,
    country?: string,
    taxId?: string,
    city?: string,
    address?: string,
    companyPhone?: string,
    companyEmail?: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const userRole = await this.prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: {
        name: 'USER',
        description: 'Usuario estándar del sistema',
        permissions: { modules: [], kpis: [], reports: [], settings: false },
      },
    });

    let companyId: string | null = null;
    let assignedRoleName = 'USER';

    if (companyName && companyName.trim()) {
      const company = await this.prisma.company.create({
        data: {
          legalName: companyName.trim(),
          taxId: (taxId && taxId.trim()) || `TEMP-${Date.now()}`,
          country: country || null,
          city: city || null,
          address: address || null,
          phone: companyPhone || null,
          email: companyEmail || null,
        },
      });
      companyId = company.id;

      const adminRole = await this.prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
          name: 'ADMIN',
          description: 'Administrador de empresa',
          permissions: { modules: ['all'], kpis: ['all'], reports: ['all'], settings: true },
        },
      });
      assignedRoleName = 'ADMIN';

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          fullName: fullName.trim(),
          roleId: adminRole.id,
          companyId: company.id,
          isActive: true,
        },
        include: { role: true },
      });
      return this.login(user);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        roleId: userRole.id,
        isActive: true,
      },
      include: { role: true },
    });

    return this.login(user);
  }

  async updateProfile(userId: string, data: { fullName?: string; phone?: string; avatarUrl?: string; notificationEmail?: string | null }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName.trim() }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl?.trim() || null }),
        ...(data.notificationEmail !== undefined && { notificationEmail: data.notificationEmail?.trim() || null }),
      },
      include: { role: true },
    });
    return {
      id: user.id,
      email: user.email,
      notificationEmail: user.notificationEmail,
      fullName: user.fullName,
      role: user.role.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
    return { success: true };
  }

  async validateJwtPayload(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, company: true },
    });
    if (!user?.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
