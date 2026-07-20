import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WarehouseUtilizationCalculator } from './calculators/utilization/warehouse-utilization.calculator';
import { TransportUtilizationCalculator } from './calculators/utilization/transport-utilization.calculator';
import { InventoryUtilizationCalculator } from './calculators/utilization/inventory-utilization.calculator';
import { AdminProductivityCalculator } from './calculators/productivity/admin-productivity.calculator';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseUtilization: WarehouseUtilizationCalculator,
    private readonly transportUtilization: TransportUtilizationCalculator,
    private readonly inventoryUtilization: InventoryUtilizationCalculator,
    private readonly adminProductivity: AdminProductivityCalculator,
  ) {}

  async getEngineeringIndices(companyId: string, startDate: Date, endDate: Date) {
    const [utilization, productivity] = await Promise.all([
      this.getUtilizationIndices(companyId, startDate, endDate),
      this.getProductivityIndices(companyId, startDate, endDate),
    ]);

    return {
      utilization,
      productivity,
    };
  }

  private async getUtilizationIndices(companyId: string, startDate: Date, endDate: Date) {
    const [warehouse, transport, inventory] = await Promise.all([
      this.warehouseUtilization.calculate(companyId, startDate, endDate),
      this.transportUtilization.calculate(companyId, startDate, endDate),
      this.inventoryUtilization.calculate(companyId, startDate, endDate),
    ]);

    return {
      warehouse,
      transport,
      inventory,
      global: (warehouse.percentage + transport.percentage + inventory.percentage) / 3,
    };
  }

  private async getProductivityIndices(companyId: string, startDate: Date, endDate: Date) {
    const admin = await this.adminProductivity.calculate(companyId, startDate, endDate);
    
    return {
      admin,
    };
  }
}