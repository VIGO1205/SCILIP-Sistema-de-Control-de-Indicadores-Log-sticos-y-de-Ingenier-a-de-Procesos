import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CostPerDriverResult {
  costPerDriver: number;
  totalTransportCost: number;
  totalDrivers: number;
}

@Injectable()
export class CostPerDriverCalculator {
  private readonly logger = new Logger(CostPerDriverCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Costo Operativo por Conductor
   * Fórmula: (Costo Transporte / Número Conductores)
   */
  async calculate(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CostPerDriverResult> {
    this.logger.log(`Calculating Cost per Driver for company ${companyId}`);

    const transportCosts = await this.prisma.transportCost.aggregate({
      _sum: { amount: true },
      where: {
        companyId,
        costDate: { gte: startDate, lte: endDate },
      },
    });

    const totalDrivers = await this.prisma.employee.count({
      where: {
        companyId,
        department: 'TRANSPORT',
        isActive: true,
      },
    });

    const totalTransportCost = Number(transportCosts._sum.amount || 0);
    const costPerDriver = totalDrivers > 0 ? totalTransportCost / totalDrivers : 0;

    return {
      costPerDriver: Number(costPerDriver.toFixed(2)),
      totalTransportCost,
      totalDrivers,
    };
  }
}
