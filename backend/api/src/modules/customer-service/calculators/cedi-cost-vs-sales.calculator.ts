import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CediCostVsSalesResult {
  cediCostVsSalesPercentage: number;
  cediOperationalCost: number;
  totalSales: number;
}

@Injectable()
export class CediCostVsSalesCalculator {
  private readonly logger = new Logger(CediCostVsSalesCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Costo de CEDI vs Ventas
   * Fórmula: (Costo Operativo CEDI / Ventas Totales) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CediCostVsSalesResult> {
    this.logger.log(`Calculating CEDI Cost vs Sales for company ${companyId}`);

    const cediCosts = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
        costType: 'WAREHOUSE_OPS', // Costo operativo del CEDI
      },
    });

    const sales = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    const cediOperationalCost = Number(cediCosts._sum.amount || 0);
    const totalSales = Number(sales._sum.totalAmount || 0);
    const cediCostVsSalesPercentage = totalSales > 0 ? (cediOperationalCost / totalSales) * 100 : 0;

    return {
      cediCostVsSalesPercentage: Number(cediCostVsSalesPercentage.toFixed(2)),
      cediOperationalCost,
      totalSales,
    };
  }
}
