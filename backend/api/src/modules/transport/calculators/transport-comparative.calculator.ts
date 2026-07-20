import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface TransportComparativeResult {
  ownCostPerUnit: number;
  thirdPartyCostPerUnit: number;
  efficiencyRatio: number;
}

@Injectable()
export class TransportComparativeCalculator {
  private readonly logger = new Logger(TransportComparativeCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Comparativo de Transporte (Propio vs 3PL)
   * Fórmula: (Costo Propio por Unidad / Costo 3PL por Unidad)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TransportComparativeResult> {
    this.logger.log(`Calculating Transport Comparative for company ${companyId}`);

    // Costos propios
    const ownCosts = await this.prisma.transportCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
      },
    });

    // Unidades transportadas propias
    const ownUnits = await this.prisma.dispatchLine.aggregate({
      _sum: { quantityDispatched: true },
      where: {
        dispatch: {
          companyId,
          dispatchDate: { gte: startDate, lte: endDate },
        },
      },
    });

    // Costos 3PL
    const thirdPartyCosts = await this.prisma.transportCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
      },
    });

    // Unidades transportadas 3PL
    const thirdPartyUnits = await this.prisma.dispatchLine.aggregate({
      _sum: { quantityDispatched: true },
      where: {
        dispatch: {
          companyId,
          dispatchDate: { gte: startDate, lte: endDate },
        },
      },
    });

    const ownTotalCost = Number(ownCosts._sum.amount || 0);
    const ownTotalUnits = Number(ownUnits._sum.quantityDispatched || 0);
    const ownCostPerUnit = ownTotalUnits > 0 ? ownTotalCost / ownTotalUnits : 0;

    const thirdPartyTotalCost = Number(thirdPartyCosts._sum.amount || 0);
    const thirdPartyTotalUnits = Number(thirdPartyUnits._sum.quantityDispatched || 0);
    const thirdPartyCostPerUnit = thirdPartyTotalUnits > 0 ? thirdPartyTotalCost / thirdPartyTotalUnits : 0;

    const efficiencyRatio = thirdPartyCostPerUnit > 0 ? ownCostPerUnit / thirdPartyCostPerUnit : 0;

    return {
      ownCostPerUnit: Number(ownCostPerUnit.toFixed(2)),
      thirdPartyCostPerUnit: Number(thirdPartyCostPerUnit.toFixed(2)),
      efficiencyRatio: Number(efficiencyRatio.toFixed(2)),
    };
  }
}
