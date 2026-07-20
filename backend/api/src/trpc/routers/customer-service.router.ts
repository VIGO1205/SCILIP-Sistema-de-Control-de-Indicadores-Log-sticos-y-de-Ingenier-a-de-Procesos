import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const dispatchLineSchema = z.object({
  productId: z.string().uuid(),
  quantityRequested: z.number().positive(),
});

const dispatchSchema = z.object({
  customerId: z.string().uuid(),
  orderReference: z.string().min(1),
  dispatchDate: z.coerce.date(),
  promisedDate: z.coerce.date().optional(),
  lines: z.array(dispatchLineSchema),
});

export const customerServiceRouter = router({
  // Obtener despachos
  getDispatches: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.customerService.getDispatches(ctx.user.companyId, input);
    }),

  // Crear un nuevo despacho
  createDispatch: protectedProcedure
    .input(dispatchSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'Dispatch')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para crear despachos',
        });
      }
      return ctx.customerService.createDispatch(ctx.user.companyId, input);
    }),

  // Actualizar estado del despacho
  updateDispatchStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.string(),
      deliveryDate: z.coerce.date().optional(),
      isPerfect: z.boolean().optional(),
      isOnTime: z.boolean().optional(),
      isComplete: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Update, 'Dispatch')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para actualizar despachos',
        });
      }
      const { id, status, ...details } = input;
      return ctx.customerService.updateDispatchStatus(id, status, details);
    }),

  // Eliminar despacho (soft delete)
  deleteDispatch: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Delete, 'Dispatch')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para eliminar despachos',
        });
      }
      return ctx.customerService.deleteDispatch(input.id, ctx.user.companyId);
    }),

  // Obtener datos mensuales de despachos
  getDispatchMonthlyData: protectedProcedure
    .input(z.object({ year: z.number().int().default(new Date().getFullYear()) }))
    .query(async ({ ctx, input }) => {
      return ctx.customerService.getDispatchMonthlyData(ctx.user.companyId, input.year);
    }),

  // Obtener clientes
  getCustomers: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.customer.findMany({
        where: { companyId: ctx.user.companyId, isActive: true },
        orderBy: { name: 'asc' },
      });
    }),
});
