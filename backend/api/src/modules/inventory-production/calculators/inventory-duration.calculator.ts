import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface InventoryDurationResult {
  daysOfInventory: number;
  finalInventoryValue: number;
  averageDailySales: number;
}

@Injectable()
export class InventoryDurationCalculator {
  private readonly logger = new Logger(InventoryDurationCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la Duración del Inventario
   * Fórmula: (Inventario Final / Ventas Promedio) * 30 días
   */
  async calculate(
    companyId: string,
    endDate: Date,
  ): Promise<InventoryDurationResult> {
    this.logger.log(`Calculating Inventory Duration for company ${companyId}`);

    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1); // Último mes para el promedio

    // Ventas del último mes
    const sales = await this.prisma.sale.aggregate({
      _sum: { totalCost: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    // Inventario final a la fecha de corte
    const inventoryMovements = await this.prisma.inventoryMovement.findMany({
      where: {
        companyId,
        movementDate: { lte: endDate },
      },
      select: { quantity: true, unitCost: true, movementType: true },
    });

    let finalInventoryValue = 0;
    for (const mov of inventoryMovements) {
      const val = Number(mov.quantity) * Number(mov.unitCost || 0);
      if (mov.movementType === 'IN' || mov.movementType === 'PURCHASE') {
        finalInventoryValue += val;
      } else {
        finalInventoryValue -= val;
      }
    }

    const totalSalesMonth = Number(sales._sum.totalCost || 0);
    const averageDailySales = totalSalesMonth / 30;
    const daysOfInventory = averageDailySales > 0 
      ? finalInventoryValue / averageDailySales 
      : 0;

    return {
      daysOfInventory: Number(daysOfInventory.toFixed(2)),
      finalInventoryValue,
      averageDailySales: Number(averageDailySales.toFixed(2)),
    };
  }
}
