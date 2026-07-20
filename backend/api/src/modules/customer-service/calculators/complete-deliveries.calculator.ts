import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CompleteDeliveriesResult {
  completePercentage: number;
  completeOrders: number;
  totalOrders: number;
}

@Injectable()
export class CompleteDeliveriesCalculator {
  private readonly logger = new Logger(CompleteDeliveriesCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Entregas Completas
   * Fórmula: (Pedidos Completos / Total Pedidos) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CompleteDeliveriesResult> {
    this.logger.log(`Calculating Complete Deliveries for company ${companyId}`);

    const totalOrders = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: 'delivered',
      },
    });

    const completeOrders = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: 'delivered',
        deliveredComplete: true,
      },
    });

    const completePercentage = totalOrders > 0 ? (completeOrders / totalOrders) * 100 : 0;

    return {
      completePercentage: Number(completePercentage.toFixed(2)),
      completeOrders,
      totalOrders,
    };
  }
}
