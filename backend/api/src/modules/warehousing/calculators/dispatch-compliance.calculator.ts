import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface DispatchComplianceResult {
  compliancePercentage: number;
  ordersDispatched: number;
  ordersRequested: number;
}

@Injectable()
export class DispatchComplianceCalculator {
  private readonly logger = new Logger(DispatchComplianceCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Nivel de Cumplimiento de Despacho
   * Fórmula: (Pedidos Despachados / Pedidos Solicitados) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DispatchComplianceResult> {
    this.logger.log(`Calculating Dispatch Compliance for company ${companyId}`);

    const ordersRequested = await this.prisma.sale.count({
      where: {
        companyId,
        saleDate: { gte: startDate, lte: endDate },
      },
    });

    const ordersDispatched = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: { in: ['dispatched', 'delivered'] },
      },
    });

    const compliancePercentage = ordersRequested > 0 
      ? (ordersDispatched / ordersRequested) * 100 
      : 0;

    return {
      compliancePercentage: Number(compliancePercentage.toFixed(2)),
      ordersDispatched,
      ordersRequested,
    };
  }
}
