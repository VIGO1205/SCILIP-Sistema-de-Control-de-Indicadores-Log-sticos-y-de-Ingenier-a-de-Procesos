import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: { role: true },
    });
    if (!user) throw new Error('Usuario no encontrado');
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      twoFactorEnabled: user.twoFactorEnabled,
      department: user.department,
      createdAt: user.createdAt,
    };
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().min(2).max(255).optional(),
      phone: z.string().max(20).optional().nullable(),
      avatarUrl: z.string().max(500).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          ...(input.fullName !== undefined && { fullName: input.fullName.trim() }),
          ...(input.phone !== undefined && { phone: input.phone?.trim() || null }),
          ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl?.trim() || null }),
        },
        include: { role: true },
      });
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      const bcrypt = await import('bcryptjs');
      const match = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!match) {
        throw new Error('La contraseña actual es incorrecta');
      }
      const newHash = await bcrypt.hash(input.newPassword, 10);
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { passwordHash: newHash },
      });
      return { success: true };
    }),

  enable2FA: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } });
    if (!user) throw new Error('Usuario no encontrado');
    if (user.twoFactorEnabled) return { alreadyEnabled: true };
    return { requiresVerification: true };
  }),

  sendOtp: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.otpService.generateOtp(ctx.user.id);
  }),

  verifyOtp: protectedProcedure
    .input(z.object({ code: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.otpService.verifyOtp(ctx.user.id, input.code);

      if (result.valid) {
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: { twoFactorEnabled: true },
        });
        return { success: true };
      }

      throw new Error(result.error || 'Código incorrecto');
    }),

  disable2FA: protectedProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } });
      if (!user) throw new Error('Usuario no encontrado');

      const bcrypt = await import('bcryptjs');
      const match = await bcrypt.compare(input.password, user.passwordHash);
      if (!match) throw new Error('Contraseña incorrecta');

      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
      });
      return { success: true };
    }),
});
