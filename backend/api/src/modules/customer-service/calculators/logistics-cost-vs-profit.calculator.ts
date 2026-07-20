import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface LogisticsCostVsProfitResult {
  logisticsCostVsProfitPercentage: number;
  totalLogisticsCost: number;
  grossProfit: number;
}

@Injectable()
export class LogisticsCostVsProfitCalculator {
  private readonly logger = new Logger(LogisticsCostVsProfitCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Costo Logístico vs Utilidad Bruta
   * Fórmula: (Costos Logísticos Totales / Utilidad Bruta) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LogisticsCostVsProfitResult> {
    this.logger.log(`Calculating Logistics Cost vs Profit for company ${companyId}`);

    const logisticsCosts = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
      },
    });

    const salesData = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true, totalCost: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    const totalLogisticsCost = Number(logisticsCosts._sum.amount || 0);
    const grossProfit = Number(salesData._sum.totalAmount || 0) - Number(salesData._sum.totalCost || 0);
    const logisticsCostVsProfitPercentage = grossProfit > 0 ? (totalLogisticsCost / grossProfit) * 100 : 0;

    return {
      logisticsCostVsProfitPercentage: Number(logisticsCostVsProfitPercentage.toFixed(2)),
      totalLogisticsCost,
      grossProfit,
    };
  }
}
