import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface OrderQualityResult {
  qualityPercentage: number;
  ordersWithoutIssues: number;
  totalOrders: number;
}

@Injectable()
export class OrderQualityCalculator {
  private readonly logger = new Logger(OrderQualityCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la Calidad de los Pedidos Generados
   * Fórmula: (Pedidos sin problemas / Total Pedidos) * 100
   * Se considera "sin problemas" si no tiene rechazos ni motivos de rechazo.
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OrderQualityResult> {
    this.logger.log(`Calculating Order Quality for company ${companyId}`);

    const totalOrders = await this.prisma.purchaseOrder.count({
      where: {
        companyId,
        orderDate: { gte: startDate, lte: endDate },
      },
    });

    const ordersWithoutIssues = await this.prisma.purchaseOrder.count({
      where: {
        companyId,
        orderDate: { gte: startDate, lte: endDate },
        status: { not: 'rejected' },
        rejectionReason: null,
      },
    });

    const qualityPercentage = totalOrders > 0 
      ? (ordersWithoutIssues / totalOrders) * 100 
      : 0;

    return {
      qualityPercentage: Number(qualityPercentage.toFixed(2)),
      ordersWithoutIssues,
      totalOrders,
    };
  }
}
