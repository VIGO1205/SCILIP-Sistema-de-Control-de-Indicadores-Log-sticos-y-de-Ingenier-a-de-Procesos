import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const importExportSchema = z.object({
  operationType: z.enum(['IMPORT', 'EXPORT']),
  productId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  operationDate: z.coerce.date(),
  quantity: z.number().int().positive(),
  unitCostUsd: z.number().positive(),
  totalCostUsd: z.number().positive(),
  freightCostUsd: z.number().optional(),
  insuranceCostUsd: z.number().optional(),
  customsDutiesUsd: z.number().optional(),
  portOfOrigin: z.string().optional(),
  portOfDestination: z.string().optional(),
  containerNumber: z.string().optional(),
  blNumber: z.string().optional(),
  status: z.string().optional(),
});

export const internationalTradeRouter = router({
  // Obtener operaciones de comercio exterior
  getOperations: protectedProcedure
    .input(z.object({
      type: z.enum(['IMPORT', 'EXPORT']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.internationalTradeService.getOperations(ctx.user.companyId, input);
    }),

  // Registrar una nueva operación
  createOperation: protectedProcedure
    .input(importExportSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'ImportExportRecord')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar operaciones de comercio exterior',
        });
      }
      return ctx.internationalTradeService.createOperation(ctx.user.companyId, input);
    }),

  // Actualizar operación
  updateOperation: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: importExportSchema }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Update, 'ImportExportRecord')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para actualizar operaciones',
        });
      }
      return ctx.internationalTradeService.updateOperation(input.id, ctx.user.companyId, input.data);
    }),

  // Eliminar operación
  deleteOperation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Delete, 'ImportExportRecord')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para eliminar operaciones',
        });
      }
      return ctx.internationalTradeService.deleteOperation(input.id, ctx.user.companyId);
    }),

  // Obtener costo unitario de importación/exportación
  getUnitCost: protectedProcedure
    .input(z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      type: z.enum(['IMPORT', 'EXPORT']),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.internationalTradeService.calculateUnitCost(
        ctx.user.companyId,
        input.startDate,
        input.endDate,
        input.type
      );
    }),

  // Obtener datos mensuales
  getMonthlyData: protectedProcedure
    .input(z.object({ year: z.number().int().default(new Date().getFullYear()) }))
    .query(async ({ ctx, input }) => {
      return ctx.internationalTradeService.getMonthlyData(ctx.user.companyId, input.year);
    }),
});
