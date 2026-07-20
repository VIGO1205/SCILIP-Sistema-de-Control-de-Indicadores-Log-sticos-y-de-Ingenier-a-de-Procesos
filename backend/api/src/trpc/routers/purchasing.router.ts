import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

export const purchasingRouter = router({
  // Obtener proveedores
  getSuppliers: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.purchasingService.getSuppliers(ctx.user.companyId);
    }),

  // Obtener todas las órdenes de compra
  getPurchaseOrders: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.purchasingService.getPurchaseOrders(ctx.user.companyId);
    }),

  // Crear una orden de compra
  createPurchaseOrder: protectedProcedure
    .input(z.object({
      supplierId: z.string().uuid(),
      poNumber: z.string(),
      orderDate: z.coerce.date(),
      expectedDeliveryDate: z.coerce.date().optional(),
      warehouseId: z.string().uuid().optional(),
      totalAmount: z.number(),
      status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']),
      notes: z.string().optional(),
      lines: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Create, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para crear órdenes de compra',
        });
      }

      return ctx.purchasingService.createPurchaseOrder(
        ctx.user.companyId,
        ctx.user.id,
        input
      );
    }),

  // Obtener órdenes de compra pendientes de aprobación
  getPendingApprovals: protectedProcedure
    .query(async ({ ctx }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      // Solo roles gerenciales pueden ver aprobaciones pendientes
      if (!ability.can(Action.Update, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para gestionar aprobaciones',
        });
      }

      return ctx.purchasingService.getPendingApprovals();
    }),

  // Aprobar una orden
  approveOrder: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Update, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para aprobar órdenes',
        });
      }

      return ctx.purchasingService.approveOrder(input.orderId, ctx.user.id);
    }),

  // Rechazar una orden
  rejectOrder: protectedProcedure
    .input(z.object({ 
      orderId: z.string().uuid(),
      reason: z.string().min(5, "Debes proporcionar un motivo de al menos 5 caracteres")
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Update, 'PurchaseOrder')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para rechazar órdenes',
        });
      }

      return ctx.purchasingService.rejectOrder(input.orderId, ctx.user.id, input.reason);
    }),

  // Crear proveedor
  createSupplier: protectedProcedure
    .input(z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      taxId: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      address: z.string().optional(),
      contactPerson: z.string().optional(),
      contactPhone: z.string().optional(),
      paymentTerms: z.string().optional(),
      leadTimeDays: z.number().min(0).optional(),
      isCertified: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'Supplier')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'No tienes permisos para crear proveedores' });
      }
      return ctx.purchasingService.createSupplier(ctx.user.companyId, input);
    }),

  // Actualizar proveedor
  updateSupplier: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: z.object({
        code: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        taxId: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        address: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        paymentTerms: z.string().optional(),
        leadTimeDays: z.number().min(0).optional(),
        isCertified: z.boolean().optional(),
        status: z.string().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Update, 'Supplier')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'No tienes permisos para actualizar proveedores' });
      }
      return ctx.purchasingService.updateSupplier(input.id, input.data);
    }),

  // Eliminar proveedor (soft delete via status)
  deleteSupplier: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Delete, 'Supplier')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'No tienes permisos para eliminar proveedores' });
      }
      return ctx.purchasingService.updateSupplier(input.id, { status: 'inactive' });
    }),

  // Obtener rating de un proveedor (auto + manual)
  getSupplierRating: protectedProcedure
    .input(z.object({ supplierId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.purchasingService.getSupplierRating(
        input.supplierId,
        ctx.user.companyId,
      );
    }),

  // Evaluar proveedor (override manual del rating)
  evaluateSupplier: protectedProcedure
    .input(z.object({
      supplierId: z.string().uuid(),
      manualRating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Update, 'Supplier')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para evaluar proveedores',
        });
      }

      return ctx.purchasingService.evaluateSupplier(
        input.supplierId,
        ctx.user.companyId,
        ctx.user.id,
        { manualRating: input.manualRating, comment: input.comment },
      );
    }),
});
