import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CostPerSquareMeterCalculator } from './calculators/cost-per-square-meter.calculator';
// ... rest of imports
import { DispatchComplianceCalculator } from './calculators/dispatch-compliance.calculator';
import { DispatchCostPerEmployeeCalculator } from './calculators/dispatch-cost-per-employee.calculator';
import { DispatchedUnitCostCalculator } from './calculators/dispatched-unit-cost.calculator';
import { StoredUnitCostCalculator } from './calculators/stored-unit-cost.calculator';
import { UnitsPerEmployeeCalculator } from './calculators/units-per-employee.calculator';

@Injectable()
export class WarehousingService {
  private readonly logger = new Logger(WarehousingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly costPerSquareMeterCalculator: CostPerSquareMeterCalculator,
    private readonly dispatchComplianceCalculator: DispatchComplianceCalculator,
    private readonly dispatchCostPerEmployeeCalculator: DispatchCostPerEmployeeCalculator,
    private readonly dispatchedUnitCostCalculator: DispatchedUnitCostCalculator,
    private readonly storedUnitCostCalculator: StoredUnitCostCalculator,
    private readonly unitsPerEmployeeCalculator: UnitsPerEmployeeCalculator,
  ) {}

  // --- CRUD Warehouses ---
  async getWarehouses(companyId: string) {
    return this.prisma.warehouse.findMany({
      where: { companyId, isActive: true },
    });
  }

  async createWarehouse(companyId: string, data: any) {
    return this.prisma.warehouse.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  // --- Operational Costs ---
  async getOperationalCosts(companyId: string, filters?: any) {
    return this.prisma.operationalCost.findMany({
      where: {
        companyId,
        ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {}),
        ...(filters?.costType ? { costType: filters.costType } : {}),
      },
      include: { warehouse: true },
      orderBy: { costDate: 'desc' },
    });
  }

  async createOperationalCost(companyId: string, data: any) {
    return this.prisma.operationalCost.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async calculateCostPerSquareMeter(warehouseId: string, startDate: Date, endDate: Date) {
    return this.costPerSquareMeterCalculator.calculate(warehouseId, startDate, endDate);
  }

  async calculateDispatchCompliance(companyId: string, startDate: Date, endDate: Date) {
    return this.dispatchComplianceCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateStoredUnitCost(warehouseId: string, startDate: Date, endDate: Date) {
    return this.storedUnitCostCalculator.calculate(warehouseId, startDate, endDate);
  }

  async calculateUnitsPerEmployee(companyId: string, startDate: Date, endDate: Date) {
    return this.unitsPerEmployeeCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateDispatchCostPerEmployee(companyId: string, startDate: Date, endDate: Date) {
    return this.dispatchCostPerEmployeeCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateDispatchedUnitCost(companyId: string, startDate: Date, endDate: Date) {
    return this.dispatchedUnitCostCalculator.calculate(companyId, startDate, endDate);
  }
}
