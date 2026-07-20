import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface UnitsPerEmployeeResult {
  unitsPerEmployee: number;
  totalUnitsDispatched: number;
  totalEmployees: number;
}

@Injectable()
export class UnitsPerEmployeeCalculator {
  private readonly logger = new Logger(UnitsPerEmployeeCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula las Unidades Despachadas por Empleado
   * Fórmula: (Unidades Despachadas / Total Empleados Bodega)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UnitsPerEmployeeResult> {
    this.logger.log(`Calculating Units per Employee for company ${companyId}`);

    const dispatches = await this.prisma.dispatchLine.aggregate({
      _sum: { quantityDispatched: true },
      where: {
        dispatch: {
          companyId,
          dispatchDate: { gte: startDate, lte: endDate },
          dispatchStatus: 'delivered',
        },
      },
    });

    const totalEmployees = await this.prisma.employee.count({
      where: {
        companyId,
        department: 'WAREHOUSE',
        isActive: true,
      },
    });

    const totalUnitsDispatched = Number(dispatches._sum.quantityDispatched || 0);
    const unitsPerEmployee = totalEmployees > 0 ? totalUnitsDispatched / totalEmployees : 0;

    return {
      unitsPerEmployee: Number(unitsPerEmployee.toFixed(2)),
      totalUnitsDispatched,
      totalEmployees,
    };
  }
}
