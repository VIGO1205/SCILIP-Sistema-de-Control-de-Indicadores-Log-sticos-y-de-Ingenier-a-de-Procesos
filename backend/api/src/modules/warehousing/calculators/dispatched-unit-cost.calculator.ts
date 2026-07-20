import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface DispatchedUnitCostResult {
  costPerDispatchedUnit: number;
  totalOperationalCost: number;
  totalUnitsDispatched: number;
}

@Injectable()
export class DispatchedUnitCostCalculator {
  private readonly logger = new Logger(DispatchedUnitCostCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Costo por Unidad Despachada
   * Fórmula: (Costo Operativo Bodega / Unidades Despachadas)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DispatchedUnitCostResult> {
    this.logger.log(`Calculating Dispatched Unit Cost for company ${companyId}`);

    const costs = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
        costType: 'WAREHOUSE_OPS',
      },
    });

    const dispatches = await this.prisma.dispatchLine.aggregate({
      _sum: { quantityDispatched: true },
      where: {
        dispatch: {
          companyId,
          dispatchDate: { gte: startDate, lte: endDate },
          dispatchStatus: 'delivered',
        },
      },
    });

    const totalOperationalCost = Number(costs._sum.amount || 0);
    const totalUnitsDispatched = Number(dispatches._sum.quantityDispatched || 0);
    const costPerDispatchedUnit = totalUnitsDispatched > 0 ? totalOperationalCost / totalUnitsDispatched : 0;

    return {
      costPerDispatchedUnit: Number(costPerDispatchedUnit.toFixed(2)),
      totalOperationalCost,
      totalUnitsDispatched,
    };
  }
}
