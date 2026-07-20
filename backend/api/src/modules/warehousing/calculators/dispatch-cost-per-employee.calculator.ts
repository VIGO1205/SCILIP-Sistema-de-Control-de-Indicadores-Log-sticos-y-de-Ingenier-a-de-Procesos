import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface DispatchCostPerEmployeeResult {
  costPerEmployee: number;
  totalOperationalCost: number;
  totalEmployees: number;
}

@Injectable()
export class DispatchCostPerEmployeeCalculator {
  private readonly logger = new Logger(DispatchCostPerEmployeeCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Costo de Despacho por Empleado
   * Fórmula: (Costo Operativo Bodega / Total Empleados Bodega)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DispatchCostPerEmployeeResult> {
    this.logger.log(`Calculating Dispatch Cost per Employee for company ${companyId}`);

    const costs = await this.prisma.operationalCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
        costType: 'WAREHOUSE_OPS',
      },
    });

    const totalEmployees = await this.prisma.employee.count({
      where: {
        companyId,
        department: 'WAREHOUSE',
        isActive: true,
      },
    });

    const totalOperationalCost = Number(costs._sum.amount || 0);
    const costPerEmployee = totalEmployees > 0 ? totalOperationalCost / totalEmployees : 0;

    return {
      costPerEmployee: Number(costPerEmployee.toFixed(2)),
      totalOperationalCost,
      totalEmployees,
    };
  }
}
