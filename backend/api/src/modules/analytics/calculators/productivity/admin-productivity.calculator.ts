import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AdminProductivityCalculator {
  constructor(private prisma: PrismaService) {}

  /**
   * Índice de Productividad Administrativa
   * (Ventas procesadas / Gastos administrativos)
   */
  async calculate(companyId: string, startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate }
      }
    });

    const adminCosts = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costCenter: 'ADMIN',
        costDate: { gte: startDate, lte: endDate }
      }
    });

    const totalSales = Number(sales._sum.totalAmount || 0);
    const totalCosts = Number(adminCosts._sum.amount || 0);

    const productivity = totalCosts > 0 ? totalSales / totalCosts : 0;

    return {
      value: Number(productivity.toFixed(2)),
      output: totalSales,
      input: totalCosts,
      unit: 'ratio'
    };
  }
}