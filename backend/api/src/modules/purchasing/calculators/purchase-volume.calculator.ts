import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PurchaseVolumeResult {
  volumePercentage: number;
  totalPurchases: number;
  totalSales: number;
}

@Injectable()
export class PurchaseVolumeCalculator {
  private readonly logger = new Logger(PurchaseVolumeCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Volumen de Compra
   * Fórmula: (Valor Compras / Valor Ventas Totales) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PurchaseVolumeResult> {
    this.logger.log(`Calculating Purchase Volume for company ${companyId}`);

    const purchases = await this.prisma.purchaseOrder.aggregate({
      _sum: { totalAmount: true },
      where: {
        companyId,
        orderDate: { gte: startDate, lte: endDate },
        status: { in: ['approved', 'received', 'completed', 'partial'] },
      },
    });

    const sales = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    const totalPurchases = Number(purchases._sum.totalAmount || 0);
    const totalSales = Number(sales._sum.totalAmount || 0);
    const volumePercentage = totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0;

    return {
      volumePercentage: Number(volumePercentage.toFixed(2)),
      totalPurchases,
      totalSales,
    };
  }
}
