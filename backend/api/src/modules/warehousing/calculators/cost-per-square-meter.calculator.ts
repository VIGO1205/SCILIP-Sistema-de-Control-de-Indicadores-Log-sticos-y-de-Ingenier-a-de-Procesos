import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CostPerSquareMeterResult {
  costPerM2: number;
  totalCost: number;
  usableArea: number;
  warehouseName: string;
}

@Injectable()
export class CostPerSquareMeterCalculator {
  private readonly logger = new Logger(CostPerSquareMeterCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Costo por Metro Cuadrado
   * Fórmula: (Costo Total Bodega / Área Total Utilizable)
   */
  async calculate(
    warehouseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CostPerSquareMeterResult> {
    this.logger.log(`Calculating Cost per M2 for warehouse ${warehouseId}`);

    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { name: true, usableAreaM2: true },
    });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const costs = await this.prisma.operationalCost.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        warehouseId,
        costDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalCost = Number(costs._sum.amount || 0);
    const usableArea = Number(warehouse.usableAreaM2 || 0);
    const costPerM2 = usableArea > 0 ? totalCost / usableArea : 0;

    return {
      costPerM2: Number(costPerM2.toFixed(2)),
      totalCost,
      usableArea,
      warehouseName: warehouse.name,
    };
  }
}
