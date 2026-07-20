import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InternationalTradeUnitCostCalculator } from './calculators/international-trade-unit-cost.calculator';

@Injectable()
export class InternationalTradeService {
  private readonly logger = new Logger(InternationalTradeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly unitCostCalculator: InternationalTradeUnitCostCalculator,
  ) {}

  // --- CRUD Operations ---
  async getOperations(companyId: string, filters?: any) {
    return this.prisma.importExportRecord.findMany({
      where: {
        companyId,
        ...(filters?.type ? { operationType: filters.type } : {}),
      },
      include: {
        product: true,
        supplier: true,
      },
      orderBy: { operationDate: 'desc' },
    });
  }

  async createOperation(companyId: string, data: any) {
    return this.prisma.importExportRecord.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async updateOperation(id: string, companyId: string, data: any) {
    return this.prisma.importExportRecord.update({
      where: { id },
      data,
    });
  }

  async deleteOperation(id: string, companyId: string) {
    return this.prisma.importExportRecord.delete({
      where: { id },
    });
  }

  async calculateUnitCost(companyId: string, startDate: Date, endDate: Date, type: 'IMPORT' | 'EXPORT') {
    return this.unitCostCalculator.calculate(companyId, startDate, endDate, type);
  }

  async getMonthlyData(companyId: string, year: number) {
    const results = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);

      const imports = await this.prisma.importExportRecord.aggregate({
        _sum: { totalCostUsd: true, quantity: true },
        _count: { id: true },
        where: {
          companyId,
          operationType: 'IMPORT',
          operationDate: { gte: monthStart, lte: monthEnd },
        },
      });

      const exports = await this.prisma.importExportRecord.aggregate({
        _sum: { totalCostUsd: true, quantity: true },
        _count: { id: true },
        where: {
          companyId,
          operationType: 'EXPORT',
          operationDate: { gte: monthStart, lte: monthEnd },
        },
      });

      results.push({
        month: months[i],
        importCost: Number(imports._sum.totalCostUsd || 0),
        importQuantity: Number(imports._sum.quantity || 0),
        importCount: imports._count.id,
        exportCost: Number(exports._sum.totalCostUsd || 0),
        exportQuantity: Number(exports._sum.quantity || 0),
        exportCount: exports._count.id,
      });
    }

    return results;
  }
}
