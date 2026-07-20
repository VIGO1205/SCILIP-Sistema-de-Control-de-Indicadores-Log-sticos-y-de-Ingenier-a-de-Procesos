import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
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
});
