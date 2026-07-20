import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const warehouseSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  totalAreaM2: z.number().positive(),
  branchId: z.string().uuid().optional(),
});

const operationalCostSchema = z.object({
  warehouseId: z.string().uuid(),
  costType: z.string(),
  amount: z.number().positive(),
  costDate: z.coerce.date(),
  description: z.string().optional(),
});

export const warehousingRouter = router({
  // Obtener todas las bodegas
  getWarehouses: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.warehousingService.getWarehouses(ctx.user.companyId);
    }),

  // Crear una nueva bodega
  createWarehouse: protectedProcedure
    .input(warehouseSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'Warehouse')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para crear bodegas',
        });
      }
      return ctx.warehousingService.createWarehouse(ctx.user.companyId, input);
    }),

  // Obtener costos operativos
  getOperationalCosts: protectedProcedure
    .input(z.object({
      warehouseId: z.string().uuid().optional(),
      costType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.warehousingService.getOperationalCosts(ctx.user.companyId, input);
    }),

  // Registrar un costo operativo
  createOperationalCost: protectedProcedure
    .input(operationalCostSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'OperationalCost')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar costos operativos',
        });
      }
      return ctx.warehousingService.createOperationalCost(ctx.user.companyId, input);
    }),
});
