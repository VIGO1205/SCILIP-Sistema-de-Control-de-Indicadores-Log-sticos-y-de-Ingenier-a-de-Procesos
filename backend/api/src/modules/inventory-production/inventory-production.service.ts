import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryAccuracyCalculator } from './calculators/inventory-accuracy.calculator';
// ... rest of imports
import { CapacityUtilizationCalculator } from './calculators/capacity-utilization.calculator';
import { EconomicInventoryValueCalculator } from './calculators/economic-inventory-value.calculator';
import { InventoryAgingCalculator } from './calculators/inventory-aging.calculator';
import { InventoryDurationCalculator } from './calculators/inventory-duration.calculator';
import { MachinePerformanceCalculator } from './calculators/machine-performance.calculator';
import { MerchandiseRotationCalculator } from './calculators/merchandise-rotation.calculator';

@Injectable()
export class InventoryProductionService {
  private readonly logger = new Logger(InventoryProductionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryAccuracyCalculator: InventoryAccuracyCalculator,
    private readonly capacityUtilizationCalculator: CapacityUtilizationCalculator,
    private readonly economicInventoryValueCalculator: EconomicInventoryValueCalculator,
    private readonly inventoryAgingCalculator: InventoryAgingCalculator,
    private readonly inventoryDurationCalculator: InventoryDurationCalculator,
    private readonly machinePerformanceCalculator: MachinePerformanceCalculator,
    private readonly merchandiseRotationCalculator: MerchandiseRotationCalculator,
  ) {}

  // --- CRUD Products ---
  async getProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(companyId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async updateProduct(id: string, companyId: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string, companyId: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --- CRUD Machines ---
  async getMachines(companyId: string) {
    return this.prisma.machine.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async createMachine(companyId: string, data: any) {
    return this.prisma.machine.create({
      data: { ...data, companyId },
    });
  }

  async updateMachine(id: string, companyId: string, data: any) {
    return this.prisma.machine.update({
      where: { id },
      data,
    });
  }

  async deleteMachine(id: string, companyId: string) {
    return this.prisma.machine.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }

  // --- CRUD Production Records ---
  async getProductionRecords(companyId: string) {
    return this.prisma.productionRecord.findMany({
      where: { companyId },
      include: { machine: true, product: true, operator: true },
      orderBy: { productionDate: 'desc' },
    });
  }

  async createProductionRecord(companyId: string, data: any) {
    return this.prisma.productionRecord.create({
      data: { ...data, companyId },
    });
  }

  async updateProductionRecord(id: string, companyId: string, data: any) {
    return this.prisma.productionRecord.update({
      where: { id },
      data,
    });
  }

  async deleteProductionRecord(id: string, companyId: string) {
    return this.prisma.productionRecord.delete({
      where: { id },
    });
  }

  // --- CRUD Inventory Movements ---
  async getMovements(companyId: string, filters?: any) {
    return this.prisma.inventoryMovement.findMany({
      where: {
        companyId,
        ...(filters?.productId ? { productId: filters.productId } : {}),
        ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {}),
      },
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { movementDate: 'desc' },
    });
  }

  async createMovement(companyId: string, data: any) {
    return this.prisma.inventoryMovement.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  // --- Physical Inventory (Audit) ---
  async createPhysicalInventory(companyId: string, data: any) {
    return this.prisma.physicalInventory.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async getPhysicalInventories(companyId: string) {
    return this.prisma.physicalInventory.findMany({
      where: { companyId },
      include: {
        product: true,
        warehouse: true,
        counter: true,
      },
      orderBy: { inventoryDate: 'desc' },
    });
  }

  async calculateInventoryAccuracy(companyId: string, startDate: Date, endDate: Date) {
    return this.inventoryAccuracyCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateCapacityUtilization(machineId: string, startDate: Date, endDate: Date) {
    return this.capacityUtilizationCalculator.calculate(machineId, startDate, endDate);
  }

  async calculateMachinePerformance(machineId: string, startDate: Date, endDate: Date) {
    return this.machinePerformanceCalculator.calculate(machineId, startDate, endDate);
  }

  async calculateMerchandiseRotation(companyId: string, startDate: Date, endDate: Date) {
    return this.merchandiseRotationCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateInventoryDuration(companyId: string, endDate: Date) {
    return this.inventoryDurationCalculator.calculate(companyId, endDate);
  }

  async calculateInventoryAging(companyId: string) {
    return this.inventoryAgingCalculator.calculate(companyId);
  }

  async calculateEconomicInventoryValue(companyId: string, endDate: Date) {
    return this.economicInventoryValueCalculator.calculate(companyId, endDate);
  }

  // --- CRUD Maintenance Orders ---
  async getMaintenanceOrders(companyId: string) {
    return this.prisma.maintenanceOrder.findMany({
      where: { companyId },
      include: { machine: true },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async createMaintenanceOrder(companyId: string, data: any) {
    const order = await this.prisma.maintenanceOrder.create({
      data: { ...data, companyId },
    });

    // Si la orden se crea directamente "en progreso", poner máquina en mantenimiento
    if (data.status === 'in_progress') {
      await this.prisma.machine.update({
        where: { id: data.machineId },
        data: { status: 'maintenance' },
      });
    }

    return order;
  }

  async updateMaintenanceOrder(id: string, companyId: string, data: any) {
    const existing = await this.prisma.maintenanceOrder.findUnique({
      where: { id },
    });

    if (!existing) throw new Error('Orden de mantenimiento no encontrada');

    const order = await this.prisma.maintenanceOrder.update({
      where: { id },
      data,
    });

    const machineId = data.machineId || existing.machineId;

    // Lógica de cambio automático de estado de máquina
    if (data.status === 'in_progress' && existing.status !== 'in_progress') {
      await this.prisma.machine.update({
        where: { id: machineId },
        data: { status: 'maintenance' },
      });
    } else if (data.status === 'completed') {
      await this.prisma.machine.update({
        where: { id: machineId },
        data: {
          status: 'operational',
          lastMaintenance: new Date(),
        },
      });
    } else if (data.status === 'cancelled' && existing.status === 'in_progress') {
      await this.prisma.machine.update({
        where: { id: machineId },
        data: { status: 'operational' },
      });
    }

    return order;
  }

  async deleteMaintenanceOrder(id: string, companyId: string) {
    const existing = await this.prisma.maintenanceOrder.findUnique({
      where: { id },
    });

    if (!existing) throw new Error('Orden de mantenimiento no encontrada');

    const deleted = await this.prisma.maintenanceOrder.delete({
      where: { id },
    });

    // Si la orden estaba en progreso, liberar la máquina
    if (existing.status === 'in_progress') {
      await this.prisma.machine.update({
        where: { id: existing.machineId },
        data: { status: 'operational' },
      });
    }

    return deleted;
  }
}
