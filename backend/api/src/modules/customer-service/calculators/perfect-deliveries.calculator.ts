import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PerfectDeliveriesResult {
  perfectDeliveriesPercentage: number;
  totalOrders: number;
  perfectOrders: number;
  onTimeOrders: number;
  completeOrders: number;
  docsOkOrders: number;
}

@Injectable()
export class PerfectDeliveriesCalculator {
  private readonly logger = new Logger(PerfectDeliveriesCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el indicador de Entregas Perfectas
   * Fórmula: (Pedidos Entregados Perfectamente / Total Pedidos Entregados) * 100
   * Un pedido es perfecto si: A tiempo AND Completo AND Documentación OK
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PerfectDeliveriesResult> {
    this.logger.log(`Calculating Perfect Deliveries KPI for company ${companyId} from ${startDate} to ${endDate}`);

    const whereBase = {
      companyId,
      dispatchDate: {
        gte: startDate,
        lte: endDate,
      },
      dispatchStatus: 'delivered',
    };

    const totalOrders = await this.prisma.dispatch.count({
      where: whereBase as any,
    });

    const perfectOrders = await this.prisma.dispatch.count({
      where: {
        ...whereBase,
        deliveredOnTime: true,
        deliveredComplete: true,
        documentationOk: true,
      } as any,
    });

    // Sub-indicadores para el desglose
    const onTimeOrders = await this.prisma.dispatch.count({
      where: {
        ...whereBase,
        deliveredOnTime: true,
      } as any,
    });

    const completeOrders = await this.prisma.dispatch.count({
      where: {
        ...whereBase,
        deliveredComplete: true,
      } as any,
    });

    const docsOkOrders = await this.prisma.dispatch.count({
      where: {
        ...whereBase,
        documentationOk: true,
      } as any,
    });

    const perfectDeliveriesPercentage = totalOrders > 0 
      ? (perfectOrders / totalOrders) * 100 
      : 0;

    return {
      perfectDeliveriesPercentage: Number(perfectDeliveriesPercentage.toFixed(2)),
      totalOrders,
      perfectOrders,
      onTimeOrders,
      completeOrders,
      docsOkOrders,
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

      const stats = await this.calculate(companyId, monthStart, monthEnd);

      results.push({
        month: months[i],
        value: stats.perfectDeliveriesPercentage,
        total: stats.totalOrders,
        perfect: stats.perfectOrders,
      });
    }

    return results;
  }
}
