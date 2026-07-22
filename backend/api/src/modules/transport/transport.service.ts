import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransportVsSalesCalculator } from './calculators/transport-vs-sales.calculator';
// ... rest of imports
import { CostPerDriverCalculator } from './calculators/cost-per-driver.calculator';
import { TransportComparativeCalculator } from './calculators/transport-comparative.calculator';

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transportVsSalesCalculator: TransportVsSalesCalculator,
    private readonly costPerDriverCalculator: CostPerDriverCalculator,
    private readonly transportComparativeCalculator: TransportComparativeCalculator,
  ) {}

  // --- CRUD Vehicles ---
  async getVehicles(companyId: string) {
    return this.prisma.vehicle.findMany({
      where: { companyId },
      orderBy: { plateNumber: 'asc' },
    });
  }

  async createVehicle(companyId: string, data: any) {
    return this.prisma.vehicle.create({
      data: { ...data, companyId },
    });
  }

  async updateVehicle(id: string, companyId: string, data: any) {
    return this.prisma.vehicle.update({
      where: { id, companyId },
      data,
    });
  }

  async deleteVehicle(id: string, companyId: string) {
    return this.prisma.vehicle.update({
      where: { id, companyId },
      data: { status: 'inactive' },
    });
  }

  // --- CRUD Drivers ---
  async getDrivers(companyId: string) {
    return this.prisma.driver.findMany({
      where: { isActive: true, employee: { companyId } },
      include: { employee: true, vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableEmployeesForDriver(companyId: string) {
    return this.prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
        driver: null,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async createDriver(companyId: string, data: any) {
    return this.prisma.driver.create({
      data: {
        employeeId: data.employeeId,
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        assignedVehicleId: data.assignedVehicleId || null,
        routesAssigned: data.routesAssigned || [],
        isActive: true,
      },
      include: { employee: true, vehicle: true },
    });
  }

  async updateDriver(id: string, companyId: string, data: any) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { employee: { select: { companyId: true } } },
    });
    if (!driver || driver.employee?.companyId !== companyId) {
      throw new Error('Conductor no encontrado');
    }
    return this.prisma.driver.update({
      where: { id },
      data: {
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        assignedVehicleId: data.assignedVehicleId || null,
        routesAssigned: data.routesAssigned || [],
        isActive: data.isActive,
      },
      include: { employee: true, vehicle: true },
    });
  }

  async deleteDriver(id: string, companyId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { employee: { select: { companyId: true } } },
    });
    if (!driver || driver.employee?.companyId !== companyId) {
      throw new Error('Conductor no encontrado');
    }
    return this.prisma.driver.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --- CRUD Transport Costs ---
  async getTransportCosts(companyId: string, filters?: any) {
    return this.prisma.transportCost.findMany({
      where: {
        companyId,
        ...(filters?.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      },
      include: { vehicle: true, driver: { include: { employee: true } } },
      orderBy: { costDate: 'desc' },
    });
  }

  async createTransportCost(companyId: string, data: any) {
    return this.prisma.transportCost.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async updateTransportCost(id: string, companyId: string, data: any) {
    return this.prisma.transportCost.update({
      where: { id, companyId },
      data,
    });
  }

  async deleteTransportCost(id: string, companyId: string) {
    return this.prisma.transportCost.delete({
      where: { id, companyId },
    });
  }

  async calculateTransportVsSales(companyId: string, year: number) {
    return this.transportVsSalesCalculator.calculate(companyId, year);
  }

  async calculateCostPerDriver(companyId: string, startDate: Date, endDate: Date) {
    return this.costPerDriverCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateTransportComparative(companyId: string, startDate: Date, endDate: Date) {
    return this.transportComparativeCalculator.calculate(companyId, startDate, endDate);
  }

  async getTransportVsSalesMonthly(companyId: string, year: number) {
    return this.transportVsSalesCalculator.getMonthlyData(companyId, year);
  }
    
  async getTransportVsSalesSummary(companyId: string, year: number) {
    const data = await this.transportVsSalesCalculator.calculate(companyId, year);
    const monthlyData = await this.getTransportVsSalesMonthly(companyId, year);
    // Calcular tendencia (comparando últimos 2 meses con datos)
    const validMonths = monthlyData.filter(m => m.totalSales > 0);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (validMonths.length >= 2) {
      const last = validMonths[validMonths.length - 1].percentage;
      const prev = validMonths[validMonths.length - 2].percentage;
      if (last > prev) trend = 'up';
      else if (last < prev) trend = 'down';
    }

    return {
      ...data,
      averagePercentage: data.percentage,
      trend,
    };
  }
}
