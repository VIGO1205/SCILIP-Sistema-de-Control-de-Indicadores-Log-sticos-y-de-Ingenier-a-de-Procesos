import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const notificationRouter = router({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { page = 1, limit = 20 } = input || {};
      const skip = (page - 1) * limit;
      const [notifications, total] = await Promise.all([
        ctx.prisma.notification.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.prisma.notification.count({ where: { userId: ctx.user.id } }),
      ]);
      return { notifications, total, page, totalPages: Math.ceil(total / limit) };
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: { userId: ctx.user.id, isRead: false },
    });
    return { count };
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!notification) throw new Error('Notificación no encontrada');
      return ctx.prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true, readAt: new Date() },
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: { userId: ctx.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.prisma.notification.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!notification) throw new Error('Notificación no encontrada');
      await ctx.prisma.notification.delete({ where: { id: input.id } });
      return { success: true };
    }),

  getPrefs: protectedProcedure.query(async ({ ctx }) => {
    let prefs = await ctx.prisma.userNotificationPref.findUnique({
      where: { userId: ctx.user.id },
    });
    if (!prefs) {
      prefs = await ctx.prisma.userNotificationPref.create({
        data: { userId: ctx.user.id },
      });
    }
    return prefs;
  }),

  updatePrefs: protectedProcedure
    .input(z.object({
      kpiAlerts: z.boolean().optional(),
      weeklyReports: z.boolean().optional(),
      purchaseOrders: z.boolean().optional(),
      inventoryChanges: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userNotificationPref.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: { userId: ctx.user.id, ...input },
      });
    }),
});
