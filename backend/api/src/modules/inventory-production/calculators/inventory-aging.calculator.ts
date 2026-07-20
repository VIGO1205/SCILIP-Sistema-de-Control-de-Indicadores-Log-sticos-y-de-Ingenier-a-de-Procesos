import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface InventoryAgingResult {
  agingPercentage: number;
  obsoleteUnits: number;
  totalUnits: number;
}

@Injectable()
export class InventoryAgingCalculator {
  private readonly logger = new Logger(InventoryAgingCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la Vejez del Inventario
   * Fórmula: (Unidades obsoletas / Total Unidades) * 100
   * Se considera obsoleta si no ha tenido movimiento en > 90 días.
   */
  async calculate(companyId: string): Promise<InventoryAgingResult> {
    this.logger.log(`Calculating Inventory Aging for company ${companyId}`);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Obtener todos los productos con su stock actual (simplificado)
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: {
        inventoryMovements: {
          orderBy: { movementDate: 'desc' },
          take: 1,
        },
      },
    });

    let obsoleteUnits = 0;
    let totalUnits = 0;

    // En una implementación real, esto vendría de una vista de stock actual
    // Aquí hacemos una estimación basada en el último movimiento
    for (const product of products) {
      // Stock estimado (esto debería venir de una tabla de saldos)
      const stock = 100; // Mock stock
      totalUnits += stock;

      const lastMovement = product.inventoryMovements[0];
      if (lastMovement && lastMovement.movementDate < ninetyDaysAgo) {
        obsoleteUnits += stock;
      }
    }

    const agingPercentage = totalUnits > 0 ? (obsoleteUnits / totalUnits) * 100 : 0;

    return {
      agingPercentage: Number(agingPercentage.toFixed(2)),
      obsoleteUnits,
      totalUnits,
    };
  }
}
