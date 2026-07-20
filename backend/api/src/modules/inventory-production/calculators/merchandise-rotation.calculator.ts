import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface MerchandiseRotationResult {
  rotationRate: number;
  totalSalesValue: number;
  averageInventoryValue: number;
}

@Injectable()
export class MerchandiseRotationCalculator {
  private readonly logger = new Logger(MerchandiseRotationCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la Rotación de Mercancía
   * Fórmula: (Ventas Acumuladas / Inventario Promedio)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MerchandiseRotationResult> {
    this.logger.log(`Calculating Merchandise Rotation for company ${companyId}`);

    // Ventas acumuladas en el periodo (a costo)
    const sales = await this.prisma.sale.aggregate({
      _sum: { totalCost: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    // Inventario promedio (Simplificado: (Inv Inicial + Inv Final) / 2)
    // Para una implementación real, se promediarían los cierres mensuales.
    const inventoryMovements = await this.prisma.inventoryMovement.findMany({
      where: {
        companyId,
        movementDate: { lte: endDate },
      },
      select: { quantity: true, unitCost: true, movementType: true },
    });

    // Cálculo simplificado del valor actual del inventario
    let totalInventoryValue = 0;
    for (const mov of inventoryMovements) {
      const val = Number(mov.quantity) * Number(mov.unitCost || 0);
      if (mov.movementType === 'IN' || mov.movementType === 'PURCHASE') {
        totalInventoryValue += val;
      } else {
        totalInventoryValue -= val;
      }
    }

    const totalSalesValue = Number(sales._sum.totalCost || 0);
    const averageInventoryValue = totalInventoryValue; // Simplificación
    const rotationRate = averageInventoryValue > 0 
      ? totalSalesValue / averageInventoryValue 
      : 0;

    return {
      rotationRate: Number(rotationRate.toFixed(2)),
      totalSalesValue,
      averageInventoryValue,
    };
  }
}
