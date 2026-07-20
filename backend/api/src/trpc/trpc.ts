import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const auditMiddleware = t.middleware(async ({ ctx, next }) => {
  const result = await next();

  // Solo auditar mutaciones exitosas
  if (result.ok) {
    try {
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.user?.id || null,
          action: 'TRPC_MUTATION',
          entityType: 'trpc',
          entityId: (result.data as any)?.id?.toString() || null,
          newValues: {},
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error saving tRPC audit log:', error);
    }
  }

  return result;
});

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
}).use(auditMiddleware);
