import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface StoredUnitCostResult {
  costPerUnit: number;
  totalWarehousingCost: number;
  totalUnitsStored: number;
}

@Injectable()
export class StoredUnitCostCalculator {
  private readonly logger = new Logger(StoredUnitCostCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Costo de Almacenamiento por Unidad
   * Fórmula: (Costo Bodegaje / Unidades Almacenadas)
   */
  async calculate(
    warehouseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<StoredUnitCostResult> {
    this.logger.log(`Calculating Stored Unit Cost for warehouse ${warehouseId}`);

    const costs = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        warehouseId,
        costDate: { gte: startDate, lte: endDate },
        costType: 'WAREHOUSING',
      },
    });

    // Unidades almacenadas (promedio o total en periodo)
    const movements = await this.prisma.inventoryMovement.aggregate({
      _sum: { quantity: true },
      where: {
        warehouseId,
        movementDate: { gte: startDate, lte: endDate },
        movementType: 'IN',
      },
    });

    const totalWarehousingCost = Number(costs._sum.amount || 0);
    const totalUnitsStored = Number(movements._sum.quantity || 0);
    const costPerUnit = totalUnitsStored > 0 ? totalWarehousingCost / totalUnitsStored : 0;

    return {
      costPerUnit: Number(costPerUnit.toFixed(2)),
      totalWarehousingCost,
      totalUnitsStored,
    };
  }
}
