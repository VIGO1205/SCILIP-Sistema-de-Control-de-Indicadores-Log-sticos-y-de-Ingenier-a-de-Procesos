import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { Action } from '../../modules/auth/casl-ability.factory';
import { TRPCError } from '@trpc/server';

const transportCostSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
  costType: z.string().min(1, 'Tipo es requerido'),
  amount: z.number().min(0, 'Monto debe ser >= 0'),
  costDate: z.coerce.date(),
  quantityLiters: z.number().min(0).optional(),
  pricePerLiter: z.number().min(0).optional(),
  distanceKm: z.number().min(0).optional(),
  hoursDriven: z.number().min(0).optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Placa es requerida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().min(1900).max(2100).optional(),
  vehicleType: z.string().optional(),
  maxWeightKg: z.number().min(0).optional(),
  maxVolumeM3: z.number().min(0).optional(),
  fuelType: z.string().optional(),
  fuelEfficiency: z.number().min(0).optional(),
  insuranceExpiry: z.string().optional(),
  technicalReviewExpiry: z.string().optional(),
  isOwnVehicle: z.boolean().optional(),
  leaseCost: z.number().min(0).optional(),
  status: z.string().optional(),
});

const driverSchema = z.object({
  employeeId: z.string().uuid('Empleado es requerido'),
  licenseNumber: z.string().min(1, 'Número de licencia es requerido'),
  licenseType: z.string().min(1, 'Tipo de licencia es requerido'),
  licenseExpiry: z.string().min(1, 'Fecha de vencimiento es requerida'),
  assignedVehicleId: z.string().uuid().optional(),
  routesAssigned: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const transportRouter = router({
  // --- Vehicles ---
  getVehicles: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.transportService.getVehicles(ctx.user.companyId);
    }),

  createVehicle: protectedProcedure
    .input(vehicleSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.createVehicle(ctx.user.companyId, input);
    }),

  updateVehicle: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: vehicleSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.updateVehicle(input.id, ctx.user.companyId, input.data);
    }),

  deleteVehicle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.deleteVehicle(input.id, ctx.user.companyId);
    }),

  // --- Drivers ---
  getDrivers: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.transportService.getDrivers(ctx.user.companyId);
    }),

  getAvailableEmployeesForDriver: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.transportService.getAvailableEmployeesForDriver(ctx.user.companyId);
    }),

  createDriver: protectedProcedure
    .input(driverSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.createDriver(ctx.user.companyId, input);
    }),

  updateDriver: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: driverSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.updateDriver(input.id, ctx.user.companyId, input.data);
    }),

  deleteDriver: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.deleteDriver(input.id, ctx.user.companyId);
    }),

  // --- Transport Costs ---
  getTransportCosts: protectedProcedure
    .input(z.object({
      vehicleId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.transportService.getTransportCosts(ctx.user.companyId, input);
    }),

  createTransportCost: protectedProcedure
    .input(transportCostSchema)
    .mutation(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Create, 'TransportCost')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permisos para registrar costos de transporte',
        });
      }
      return ctx.transportService.createTransportCost(ctx.user.companyId, input);
    }),

  updateTransportCost: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: transportCostSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.updateTransportCost(input.id, ctx.user.companyId, input.data);
    }),

  deleteTransportCost: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.transportService.deleteTransportCost(input.id, ctx.user.companyId);
    }),

  // --- Analytics ---
  getTransportVsSalesSummary: protectedProcedure
    .input(z.object({ year: z.number().int().default(new Date().getFullYear()) }))
    .query(async ({ ctx, input }) => {
      return ctx.transportService.getTransportVsSalesSummary(ctx.user.companyId, input.year);
    }),

  getTransportVsSalesMonthly: protectedProcedure
    .input(z.object({ year: z.number().int().default(new Date().getFullYear()) }))
    .query(async ({ ctx, input }) => {
      return ctx.transportService.getTransportVsSalesMonthly(ctx.user.companyId, input.year);
    }),
});
