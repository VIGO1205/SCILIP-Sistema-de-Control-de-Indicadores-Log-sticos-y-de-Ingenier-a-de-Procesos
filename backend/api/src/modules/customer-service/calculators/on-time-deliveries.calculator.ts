import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface OnTimeDeliveriesResult {
  onTimePercentage: number;
  onTimeOrders: number;
  totalOrders: number;
}

@Injectable()
export class OnTimeDeliveriesCalculator {
  private readonly logger = new Logger(OnTimeDeliveriesCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Entregas Recibidas a Tiempo
   * Fórmula: (Pedidos Entregados a Tiempo / Total Pedidos) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OnTimeDeliveriesResult> {
    this.logger.log(`Calculating On Time Deliveries for company ${companyId}`);

    const totalOrders = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: 'delivered',
      },
    });

    const onTimeOrders = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: 'delivered',
        deliveredOnTime: true,
      },
    });

    const onTimePercentage = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0;

    return {
      onTimePercentage: Number(onTimePercentage.toFixed(2)),
      onTimeOrders,
      totalOrders,
    };
  }
}
