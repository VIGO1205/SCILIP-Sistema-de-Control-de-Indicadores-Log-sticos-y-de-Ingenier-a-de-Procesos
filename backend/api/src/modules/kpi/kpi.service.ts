import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KpiAlertService } from './kpi-alert.service';
import { PurchasingService } from '../purchasing/purchasing.service';
// ... rest of imports
import { TransportService } from '../transport/transport.service';
import { InventoryProductionService } from '../inventory-production/inventory-production.service';
import { WarehousingService } from '../warehousing/warehousing.service';
import { CustomerServiceService } from '../customer-service/customer-service.service';
import { InternationalTradeService } from '../international-trade/international-trade.service';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: KpiAlertService,
    private readonly purchasingService: PurchasingService,
    private readonly transportService: TransportService,
    private readonly inventoryProductionService: InventoryProductionService,
    private readonly warehousingService: WarehousingService,
    private readonly customerService: CustomerServiceService,
    private readonly internationalTradeService: InternationalTradeService,
  ) {}

  /**
   * Guarda un valor calculado en el histórico y verifica alertas
   */
  async saveKpiValue(kpiCode: string, value: number, periodDate: Date, companyId: string, branchId?: string) {
    const kpiDef = await this.prisma.kpiDefinition.findUnique({
      where: { code: kpiCode },
    });

    if (!kpiDef) {
      this.logger.error(`KPI Definition not found for code: ${kpiCode}`);
      return;
    }

    const kpiValue = await this.prisma.kpiValue.upsert({
      where: {
        kpiId_companyId_periodDate_branchId: {
          kpiId: kpiDef.id,
          companyId,
          periodDate,
          branchId: branchId || null,
        },
      },
      update: {
        actualValue: value,
        calculatedAt: new Date(),
      },
      create: {
        kpiId: kpiDef.id,
        companyId,
        periodDate,
        branchId: branchId || null,
        actualValue: value,
        varianceAbsolute: 0, // Cálculo de varianza omitido por brevedad
      },
    });

    // Verificar alertas en segundo plano
    this.alertService.checkAlerts(kpiValue).catch(err => 
      this.logger.error(`Error checking alerts for ${kpiCode}: ${err.message}`)
    );

    return kpiValue;
  }

  // --- Compras ---
  async calculatePerfectReceipts(input: { companyId: string; startDate: Date; endDate: Date; supplierId?: string }) {
    const result = await this.purchasingService.calculatePerfectReceipts(input);
    return result;
  }

  async getPerfectReceiptsTimeSeries(input: { companyId: string; startDate: Date; endDate: Date; supplierId?: string }) {
    return this.purchasingService.getPerfectReceiptsTimeSeries(input);
  }

  async getSupplierCertification(companyId: string) {
    return this.purchasingService.calculateSupplierCertification(companyId);
  }

  async getOrderQuality(companyId: string, startDate: Date, endDate: Date) {
    return this.purchasingService.calculateOrderQuality(companyId, startDate, endDate);
  }

  async getPurchaseVolume(companyId: string, startDate: Date, endDate: Date) {
    return this.purchasingService.calculatePurchaseVolume(companyId, startDate, endDate);
  }

  // --- Inventarios y Producción ---
  async getInventoryAccuracy(companyId: string, startDate: Date, endDate: Date) {
    return this.inventoryProductionService.calculateInventoryAccuracy(companyId, startDate, endDate);
  }

  async getCapacityUtilization(machineId: string, startDate: Date, endDate: Date) {
    return this.inventoryProductionService.calculateCapacityUtilization(machineId, startDate, endDate);
  }

  async getMachinePerformance(machineId: string, startDate: Date, endDate: Date) {
    return this.inventoryProductionService.calculateMachinePerformance(machineId, startDate, endDate);
  }

  async getMerchandiseRotation(companyId: string, startDate: Date, endDate: Date) {
    return this.inventoryProductionService.calculateMerchandiseRotation(companyId, startDate, endDate);
  }

  async getInventoryDuration(companyId: string, endDate: Date) {
    return this.inventoryProductionService.calculateInventoryDuration(companyId, endDate);
  }

  async getInventoryAging(companyId: string) {
    return this.inventoryProductionService.calculateInventoryAging(companyId);
  }

  async getEconomicInventoryValue(companyId: string, endDate: Date) {
    return this.inventoryProductionService.calculateEconomicInventoryValue(companyId, endDate);
  }

  async getStoredUnitCost(warehouseId: string, startDate: Date, endDate: Date) {
    return this.warehousingService.calculateStoredUnitCost(warehouseId, startDate, endDate);
  }

  // --- Almacenamiento ---
  async getCostPerSquareMeter(warehouseId: string, startDate: Date, endDate: Date) {
    return this.warehousingService.calculateCostPerSquareMeter(warehouseId, startDate, endDate);
  }

  async getDispatchCompliance(companyId: string, startDate: Date, endDate: Date) {
    return this.warehousingService.calculateDispatchCompliance(companyId, startDate, endDate);
  }

  async getUnitsPerEmployee(companyId: string, startDate: Date, endDate: Date) {
    return this.warehousingService.calculateUnitsPerEmployee(companyId, startDate, endDate);
  }

  async getDispatchCostPerEmployee(companyId: string, startDate: Date, endDate: Date) {
    return this.warehousingService.calculateDispatchCostPerEmployee(companyId, startDate, endDate);
  }

  async getDispatchedUnitCost(companyId: string, startDate: Date, endDate: Date) {
    return this.warehousingService.calculateDispatchedUnitCost(companyId, startDate, endDate);
  }

  // --- Transporte ---
  async getTransportVsSales(companyId: string, year: number) {
    return this.transportService.calculateTransportVsSales(companyId, year);
  }

  async getCostPerDriver(companyId: string, startDate: Date, endDate: Date) {
    return this.transportService.calculateCostPerDriver(companyId, startDate, endDate);
  }

  async getTransportComparative(companyId: string, startDate: Date, endDate: Date) {
    return this.transportService.calculateTransportComparative(companyId, startDate, endDate);
  }

  // --- Servicio al Cliente ---
  async getPerfectDeliveries(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculatePerfectDeliveries(companyId, startDate, endDate);
  }

  async getOnTimeDeliveries(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculateOnTimeDeliveries(companyId, startDate, endDate);
  }

  async getCompleteDeliveries(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculateCompleteDeliveries(companyId, startDate, endDate);
  }

  async getDocumentationAccuracy(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculateDocumentationAccuracy(companyId, startDate, endDate);
  }

  async getLogisticsCostVsSales(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculateLogisticsCostVsSales(companyId, startDate, endDate);
  }

  async getLogisticsCostVsProfit(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculateLogisticsCostVsProfit(companyId, startDate, endDate);
  }

  async getCediCostVsSales(companyId: string, startDate: Date, endDate: Date) {
    return this.customerService.calculateCediCostVsSales(companyId, startDate, endDate);
  }

  async getInternationalTradeUnitCost(companyId: string, startDate: Date, endDate: Date, type: 'IMPORT' | 'EXPORT') {
    return this.internationalTradeService.calculateUnitCost(companyId, startDate, endDate, type);
  }

  /** Catálogo de definiciones KPI (Fase 1A) */
  async listDefinitions(categoryCode?: string) {
    return this.prisma.kpiDefinition.findMany({
      where: {
        isActive: true,
        ...(categoryCode
          ? { category: { code: categoryCode } }
          : {}),
      },
      include: {
        category: {
          select: { code: true, name: true, color: true, displayOrder: true },
        },
      },
      orderBy: [{ category: { displayOrder: 'asc' } }, { code: 'asc' }],
    });
  }

  /** Serie temporal desde kpi_values (datos sembrados o histórico) */
  async getKpiTimeSeriesFromDb(
    companyId: string,
    code: string,
    startDate: Date,
    endDate: Date,
  ) {
    const definition = await this.prisma.kpiDefinition.findUnique({
      where: { code },
      include: { category: true },
    });
    if (!definition) {
      return [];
    }

    const values = await this.prisma.kpiValue.findMany({
      where: {
        kpiId: definition.id,
        companyId,
        branchId: null,
        periodDate: { gte: startDate, lte: endDate },
      },
      orderBy: { periodDate: 'asc' },
    });

    return values.map((v) => ({
      period: v.periodDate,
      month: v.periodDate.toISOString().slice(0, 7),
      value: v.actualValue != null ? Number(v.actualValue) : null,
      target: v.targetValue != null ? Number(v.targetValue) : Number(definition.targetValue),
      previous: v.previousValue != null ? Number(v.previousValue) : null,
      status: v.status,
      variancePercentage: v.variancePercentage != null ? Number(v.variancePercentage) : null,
      code: definition.code,
      name: definition.name,
      unit: definition.unit,
      chartType: definition.dataSource?.replace('chart:', '') ?? 'line',
      category: definition.category.name,
    }));
  }

  /** Último valor almacenado en el rango */
  async getKpiSnapshotFromDb(
    companyId: string,
    code: string,
    startDate: Date,
    endDate: Date,
  ) {
    const definition = await this.prisma.kpiDefinition.findUnique({
      where: { code },
      include: { category: true },
    });
    if (!definition) {
      return null;
    }

    const latest = await this.prisma.kpiValue.findFirst({
      where: {
        kpiId: definition.id,
        companyId,
        branchId: null,
        periodDate: { gte: startDate, lte: endDate },
      },
      orderBy: { periodDate: 'desc' },
    });

    if (!latest) {
      return null;
    }

    return {
      code: definition.code,
      name: definition.name,
      formula: definition.formula,
      unit: definition.unit,
      chartType: definition.dataSource?.replace('chart:', '') ?? 'line',
      category: definition.category,
      periodDate: latest.periodDate,
      value: latest.actualValue != null ? Number(latest.actualValue) : null,
      target: latest.targetValue != null ? Number(latest.targetValue) : Number(definition.targetValue),
      previous: latest.previousValue != null ? Number(latest.previousValue) : null,
      status: latest.status,
      variancePercentage: latest.variancePercentage != null ? Number(latest.variancePercentage) : null,
      direction: definition.direction,
    };
  }
}
