import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TransportVsSalesCalculator {
  private readonly logger = new Logger(TransportVsSalesCalculator.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * Calcula el indicador de Costo de Transporte vs Venta
   * Fórmula del PDF: (Costo del transporte / Valor ventas totales) * 100
   */
  async calculate(companyId: string, year: number): Promise<any> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const transportCosts = await this.prisma.transportCost.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        companyId,
        costDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const sales = await this.prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        companyId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalTransportCost = Number(transportCosts._sum.amount || 0);
    const totalSales = Number(sales._sum.totalAmount || 0);
    const percentage = totalSales > 0 ? (totalTransportCost / totalSales) * 100 : 0;

    return {
      totalTransportCost,
      totalSales,
      percentage: Number(percentage.toFixed(2)),
    };
  }

  async getMonthlyData(companyId: string, year: number): Promise<any[]> {
    const results = [];
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);

      const tc = await this.prisma.transportCost.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          companyId,
          costDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const s = await this.prisma.sale.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          companyId,
          saleDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const transportCost = Number(tc._sum.amount || 0);
      const totalSales = Number(s._sum.totalAmount || 0);
      const percentage = totalSales > 0 ? (transportCost / totalSales) * 100 : 0;

      results.push({
        month: months[i],
        transportCost,
        totalSales,
        percentage: Number(percentage.toFixed(2)),
      });
    }

    return results;
  }
}
