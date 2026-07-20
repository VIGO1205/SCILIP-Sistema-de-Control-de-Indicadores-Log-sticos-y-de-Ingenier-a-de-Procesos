import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface DocumentationAccuracyResult {
  accuracyPercentage: number;
  docsOkOrders: number;
  totalOrders: number;
}

@Injectable()
export class DocumentationAccuracyCalculator {
  private readonly logger = new Logger(DocumentationAccuracyCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calidad de la Documentación
   * Fórmula: (Facturas sin Errores / Total Facturas Generadas) * 100
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DocumentationAccuracyResult> {
    this.logger.log(`Calculating Documentation Accuracy for company ${companyId}`);

    const totalOrders = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: 'delivered',
      },
    });

    const docsOkOrders = await this.prisma.dispatch.count({
      where: {
        companyId,
        dispatchDate: { gte: startDate, lte: endDate },
        dispatchStatus: 'delivered',
        documentationOk: true,
      },
    });

    const accuracyPercentage = totalOrders > 0 ? (docsOkOrders / totalOrders) * 100 : 0;

    return {
      accuracyPercentage: Number(accuracyPercentage.toFixed(2)),
      docsOkOrders,
      totalOrders,
    };
  }
}
