import { router, protectedProcedure } from '../trpc'; 
 import { z } from 'zod'; 
 import { Action } from '../../modules/auth/casl-ability.factory';
 import { TRPCError } from '@trpc/server';
 import { subject } from '@casl/ability';
 
 // Schema para filtros de KPI 
 export const kpiFiltersSchema = z.object({ 
   startDate: z.coerce.date(), 
   endDate: z.coerce.date(), 
   supplierId: z.string().uuid().optional(), 
   warehouseId: z.string().uuid().optional(),
   machineId: z.string().uuid().optional(),
   periodicity: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly') 
 }); 
 
export const kpiInputSchema = kpiFiltersSchema.extend({ 
  code: z.string() 
}); 

const listDefinitionsSchema = z.object({
  categoryCode: z.string().optional(),
});

// Router de KPIs 
export const kpiRouter = router({
  listDefinitions: protectedProcedure
    .input(listDefinitionsSchema)
    .query(async ({ ctx, input }) => {
      return ctx.kpiService.listDefinitions(input.categoryCode);
    }),

  getKpiSnapshot: protectedProcedure
    .input(kpiInputSchema)
    .query(async ({ ctx, input }) => {
      const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
      if (!ability.can(Action.Read, subject('Kpi', { code: input.code } as any))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Acceso denegado al indicador ${input.code}`,
        });
      }
      const snapshot = await ctx.kpiService.getKpiSnapshotFromDb(
        ctx.user.companyId,
        input.code,
        input.startDate,
        input.endDate,
      );
      if (snapshot) {
        return snapshot;
      }
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Sin datos almacenados para ${input.code} en el periodo indicado`,
      });
    }),
   // Obtener datos de cualquier KPI con validación de permisos CASL
    getKpiData: protectedProcedure 
      .input(kpiInputSchema) 
      .query(async ({ ctx, input }) => { 
        const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
        
        // Verificación de permisos por código de KPI
        if (!ability.can(Action.Read, subject('Kpi', { code: input.code } as any))) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Acceso denegado: No tienes permisos para ver el indicador ${input.code}. Tu rol es: ${ctx.user.role.name}`,
          });
        }

        switch (input.code) {
          // ── COMPRAS ──
          case 'NOR_DIS_IND_01': // Certificación de Proveedores
            return ctx.kpiService.getSupplierCertification(ctx.user.companyId);
          case 'NOR_DIS_IND_02': // Calidad de Pedidos Generados
            return ctx.kpiService.getOrderQuality(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_03': // Volumen de Compra
            return ctx.kpiService.getPurchaseVolume(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_04': // Entregas Perfectamente Recibidas
            return ctx.kpiService.calculatePerfectReceipts({
              companyId: ctx.user.companyId,
              startDate: input.startDate,
              endDate: input.endDate,
              supplierId: input.supplierId,
            });
          // ── INVENTARIOS Y PRODUCCIÓN ──
          case 'NOR_DIS_IND_05': // Rotación de Mercancía
            return ctx.kpiService.getMerchandiseRotation(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_06': // Duración del Inventario
            return ctx.kpiService.getInventoryDuration(ctx.user.companyId, input.endDate);
          case 'NOR_DIS_IND_07': // Vejez del Inventario
            return ctx.kpiService.getInventoryAging(ctx.user.companyId);
          case 'NOR_DIS_IND_08': // Valor Económico del Inventario
            return ctx.kpiService.getEconomicInventoryValue(ctx.user.companyId, input.endDate);
          case 'NOR_DIS_IND_09': // Exactitud de Inventario
            return ctx.kpiService.getInventoryAccuracy(ctx.user.companyId, input.startDate, input.endDate);
          // ── ALMACENAMIENTO ──
          case 'NOR_DIS_IND_10': { // Costo por Unidad Almacenada
            const warehouseId = input.warehouseId || (await ctx.prisma.warehouse.findFirst({ where: { companyId: ctx.user.companyId } }))?.id;
            if (!warehouseId) return { costPerUnit: 0, totalWarehousingCost: 0, totalUnitsStored: 0, message: 'Sin bodegas registradas' };
            return ctx.kpiService.getStoredUnitCost(warehouseId, input.startDate, input.endDate);
          }
          case 'NOR_DIS_IND_11': // Costo por Unidad Despachada
            return ctx.kpiService.getDispatchedUnitCost(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_12': // Unidades Despachadas por Empleado
            return ctx.kpiService.getUnitsPerEmployee(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_13': { // Costo por Metro Cuadrado
            const warehouseId = input.warehouseId || (await ctx.prisma.warehouse.findFirst({ where: { companyId: ctx.user.companyId } }))?.id;
            if (!warehouseId) return { costPerM2: 0, totalCost: 0, usableArea: 0, message: 'Sin bodegas registradas' };
            return ctx.kpiService.getCostPerSquareMeter(warehouseId, input.startDate, input.endDate);
          }
          case 'NOR_DIS_IND_14': // Costo de Despachos por Empleado
            return ctx.kpiService.getDispatchCostPerEmployee(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_15': // Nivel de Cumplimiento en Despachos
            return ctx.kpiService.getDispatchCompliance(ctx.user.companyId, input.startDate, input.endDate);
          // ── TRANSPORTE ──
          case 'NOR_DIS_IND_16': // Costo de Transporte vs Ventas
            return ctx.kpiService.getTransportVsSales(ctx.user.companyId, input.startDate.getFullYear());
          case 'NOR_DIS_IND_17': // Costo Operativo por Conductor
            return ctx.kpiService.getCostPerDriver(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_18': // Comparativo de Transporte
            return ctx.kpiService.getTransportComparative(ctx.user.companyId, input.startDate, input.endDate);
          // ── SERVICIO AL CLIENTE ──
          case 'NOR_DIS_IND_19': // Entregas Perfectas
            return ctx.kpiService.getPerfectDeliveries(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_20': // Entregas a Tiempo
            return ctx.kpiService.getOnTimeDeliveries(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_21': // Pedidos Completos
            return ctx.kpiService.getCompleteDeliveries(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_22': // Documentación sin Problemas
            return ctx.kpiService.getDocumentationAccuracy(ctx.user.companyId, input.startDate, input.endDate);
          // ── COSTOS LOGÍSTICOS ──
          case 'NOR_DIS_IND_23': // Costos Logísticos vs Ventas
            return ctx.kpiService.getLogisticsCostVsSales(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_24': // Costos Logísticos vs Utilidad Bruta
            return ctx.kpiService.getLogisticsCostVsProfit(ctx.user.companyId, input.startDate, input.endDate);
          case 'NOR_DIS_IND_25': // Costo CEDI vs Ventas
            return ctx.kpiService.getCediCostVsSales(ctx.user.companyId, input.startDate, input.endDate);
          // ── PRODUCCIÓN Y COMERCIO EXTERIOR ──
          case 'NOR_DIS_IND_26': { // Capacidad de Producción Utilizada
            const machineId = input.machineId || (await ctx.prisma.machine.findFirst({ where: { companyId: ctx.user.companyId } }))?.id;
            if (!machineId) return { utilizationPercentage: 0, capacityUsed: 0, capacityAvailable: 0, message: 'Sin máquinas registradas' };
            return ctx.kpiService.getCapacityUtilization(machineId, input.startDate, input.endDate);
          }
          case 'NOR_DIS_IND_27': { // Rendimiento de Máquina
            const machineId = input.machineId || (await ctx.prisma.machine.findFirst({ where: { companyId: ctx.user.companyId } }))?.id;
            if (!machineId) return { performancePercentage: 0, realProduction: 0, standardCapacity: 0, message: 'Sin máquinas registradas' };
            return ctx.kpiService.getMachinePerformance(machineId, input.startDate, input.endDate);
          }
          case 'NOR_DIS_IND_28': // Costo por Unidad Importada/Exportada
            return ctx.kpiService.getInternationalTradeUnitCost(ctx.user.companyId, input.startDate, input.endDate, 'IMPORT');
          default:
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Indicador ${input.code} no implementado aún`,
            });
        }
      }), 
   
   // Obtener series de tiempo para gráficos 
   getKpiTimeSeries: protectedProcedure 
     .input(kpiInputSchema) 
     .query(async ({ ctx, input }) => { 
       const ability = ctx.caslAbilityFactory.createForUser(ctx.user);
       
        if (!ability.can(Action.Read, subject('Kpi', { code: input.code } as any))) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `No tienes permiso para ver el indicador ${input.code}`,
          });
       }

       const stored = await ctx.kpiService.getKpiTimeSeriesFromDb(
         ctx.user.companyId,
         input.code,
         input.startDate,
         input.endDate,
       );
       if (stored.length > 0) {
         return stored;
       }
       return [];
     }), 
 }); 
