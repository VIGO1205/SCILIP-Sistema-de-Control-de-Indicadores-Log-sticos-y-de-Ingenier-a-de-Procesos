import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface LogisticsCostVsSalesResult {
  logisticsCostPercentage: number;
  totalLogisticsCost: number;
  totalSales: number;
}

@Injectable()
export class LogisticsCostVsSalesCalculator {
  private readonly logger = new Logger(LogisticsCostVsSalesCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Costo Logístico vs Ventas
   * Fórmula: (Costos Logísticos Totales / Ventas Totales) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LogisticsCostVsSalesResult> {
    this.logger.log(`Calculating Logistics Cost vs Sales for company ${companyId}`);

    const logisticsCosts = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
        // Incluye todos los costos logísticos (Transporte, Bodega, etc.)
      },
    });

    const sales = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    const totalLogisticsCost = Number(logisticsCosts._sum.amount || 0);
    const totalSales = Number(sales._sum.totalAmount || 0);
    const logisticsCostPercentage = totalSales > 0 ? (totalLogisticsCost / totalSales) * 100 : 0;

    return {
      logisticsCostPercentage: Number(logisticsCostPercentage.toFixed(2)),
      totalLogisticsCost,
      totalSales,
    };
  }
}
