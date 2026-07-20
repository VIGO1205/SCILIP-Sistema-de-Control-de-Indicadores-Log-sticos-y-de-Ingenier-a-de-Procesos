import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface InternationalTradeUnitCostResult {
  unitCost: number;
  totalOperationCost: number;
  totalUnits: number;
}

@Injectable()
export class InternationalTradeUnitCostCalculator {
  private readonly logger = new Logger(InternationalTradeUnitCostCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Costo Unitario de Importación/Exportación
   * Fórmula: (Costo Total Operación / Unidades Importadas/Exportadas)
   * Fuente: import_export_records (tabla oficial de comercio exterior)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
    type: 'IMPORT' | 'EXPORT'
  ): Promise<InternationalTradeUnitCostResult> {
    this.logger.log(`Calculating International Trade Unit Cost for company ${companyId}, type ${type}`);

    const agg = await this.prisma.importExportRecord.aggregate({
      _sum: { totalCostUsd: true, quantity: true },
      _count: { id: true },
      where: {
        companyId,
        operationType: type,
        operationDate: { gte: startDate, lte: endDate },
      },
    });

    const totalOperationCost = Number(agg._sum.totalCostUsd || 0);
    const totalUnits = Number(agg._sum.quantity || 0);
    const unitCost = totalUnits > 0 ? totalOperationCost / totalUnits : 0;

    return {
      unitCost: Number(unitCost.toFixed(2)),
      totalOperationCost,
      totalUnits,
    };
  }
}
