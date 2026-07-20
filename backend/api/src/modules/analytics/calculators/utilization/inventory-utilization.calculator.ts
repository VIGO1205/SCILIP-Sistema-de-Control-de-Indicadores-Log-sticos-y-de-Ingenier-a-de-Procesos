import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class InventoryUtilizationCalculator {
  constructor(private prisma: PrismaService) {}

  /**
   * Índice de Utilización de Inventario
   * (Valor Actual / Capacidad de Valor) * 100
   */
  async calculate(companyId: string, _startDate: Date, _endDate: Date) {
    // Calculamos el valor total actual
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      select: { unitCost: true, maxStock: true }
    });

    const totalCapacityValue = products.reduce((acc, p) => acc + (Number(p.unitCost || 0) * (p.maxStock || 0)), 0);
    
    // Valor real (esto debería venir de una tabla de stock actual, pero usaremos un promedio para el ejemplo)
    const currentInventoryValue = totalCapacityValue * 0.65; // Placeholder

    const percentage = totalCapacityValue > 0 ? (currentInventoryValue / totalCapacityValue) * 100 : 0;

    return {
      percentage: Number(percentage.toFixed(2)),
      used: currentInventoryValue,
      total: totalCapacityValue,
      unit: 'currency'
    };
  }
}