import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const movementSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER']),
  quantity: z.number().positive(),
  unitCost: z.number().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const physicalInventorySchema = z.object({
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  systemQuantity: z.number(),
  physicalQuantity: z.number(),
  countedById: z.string().uuid(),
  notes: z.string().optional(),
});

const productSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
});

const machineSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  maxCapacity: z.number().min(0).optional(),
  capacityUnit: z.string().optional(),
  efficiencyRate: z.number().min(0).max(100).optional(),
  hourlyRate: z.number().min(0).optional(),
  status: z.string().optional(),
});

const productionRecordSchema = z.object({
  productionDate: z.coerce.date(),
  machineId: z.string().uuid(),
  productId: z.string().uuid(),
  batchNumber: z.string().optional(),
  quantityProduced: z.number().min(0),
  quantityDefective: z.number().min(0).default(0),
  hoursOperated: z.number().min(0),
  downtimeHours: z.number().min(0).optional(),
  setupTime: z.number().min(0).optional(),
  operatorId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const maintenanceOrderSchema = z.object({
  machineId: z.string().uuid(),
  type: z.enum(['preventivo', 'correctivo', 'predictivo']),
  title: z.string().min(1, 'Título es requerido'),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduledDate: z.coerce.date(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  technician: z.string().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const inventoryRouter = router({
  // Obtener productos
  getProducts: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getProducts(ctx.user.companyId);
    }),

  // Obtener bodegas
  getWarehouses: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.warehousingService.getWarehouses(ctx.user.companyId);
    }),

  // Obtener máquinas
  getMachines: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getMachines(ctx.user.companyId);
    }),

  // Obtener movimientos
  getMovements: protectedProcedure
    .input(z.object({
      productId: z.string().uuid().optional(),
      warehouseId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.inventoryService.getMovements(ctx.user.companyId, input);
    }),

  // Crear movimiento
  createMovement: protectedProcedure
    .input(movementSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Create, 'InventoryMovement')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar movimientos de inventario',
        });
      }

      return ctx.inventoryService.createMovement(ctx.user.companyId, input);
    }),

  // Crear auditoría física
  createPhysicalInventory: protectedProcedure
    .input(physicalInventorySchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      
      if (!ability.can(Action.Create, 'PhysicalInventory')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar auditorías de inventario',
        });
      }

      return ctx.inventoryService.createPhysicalInventory(ctx.user.companyId, input);
    }),

  // Obtener auditorías físicas
  getPhysicalInventories: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getPhysicalInventories(ctx.user.companyId);
    }),

  // Crear producto
  createProduct: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.createProduct(ctx.user.companyId, input);
    }),

  // Actualizar producto
  updateProduct: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: productSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.updateProduct(input.id, ctx.user.companyId, input.data);
    }),

  // Eliminar producto (soft delete)
  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.deleteProduct(input.id, ctx.user.companyId);
    }),

  // --- Machine endpoints ---
  createMachine: protectedProcedure
    .input(machineSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.createMachine(ctx.user.companyId, input);
    }),

  updateMachine: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: machineSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.updateMachine(input.id, ctx.user.companyId, input.data);
    }),

  deleteMachine: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.deleteMachine(input.id, ctx.user.companyId);
    }),

  // --- Production Record endpoints ---
  getProductionRecords: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getProductionRecords(ctx.user.companyId);
    }),

  createProductionRecord: protectedProcedure
    .input(productionRecordSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.createProductionRecord(ctx.user.companyId, input);
    }),

  updateProductionRecord: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: productionRecordSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.updateProductionRecord(input.id, ctx.user.companyId, input.data);
    }),

  deleteProductionRecord: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.deleteProductionRecord(input.id, ctx.user.companyId);
    }),

  // --- Maintenance Order endpoints ---
  getMaintenanceOrders: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.inventoryService.getMaintenanceOrders(ctx.user.companyId);
    }),

  createMaintenanceOrder: protectedProcedure
    .input(maintenanceOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.createMaintenanceOrder(ctx.user.companyId, input);
    }),

  updateMaintenanceOrder: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: maintenanceOrderSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.updateMaintenanceOrder(input.id, ctx.user.companyId, input.data);
    }),

  deleteMaintenanceOrder: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.inventoryService.deleteMaintenanceOrder(input.id, ctx.user.companyId);
    }),
});
