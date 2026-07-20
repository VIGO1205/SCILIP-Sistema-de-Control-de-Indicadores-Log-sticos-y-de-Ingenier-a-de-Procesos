import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface MachinePerformanceResult {
  performancePercentage: number;
  realProduction: number;
  standardCapacity: number;
  hoursOperated: number;
  period: string;
}

@Injectable()
export class MachinePerformanceCalculator {
  private readonly logger = new Logger(MachinePerformanceCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el Rendimiento de Máquinas
   * Fórmula: (Producción Real / Capacidad Estándar) * 100
   */
  async calculate(
    machineId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MachinePerformanceResult> {
    this.logger.log(`Calculating Machine Performance for machine ${machineId}`);

    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: { name: true, efficiencyRate: true, maxCapacity: true },
    });

    if (!machine) {
      throw new Error('Machine not found');
    }

    const production = await this.prisma.productionRecord.aggregate({
      _sum: {
        quantityProduced: true,
        hoursOperated: true,
      },
      where: {
        machineId,
        productionDate: { gte: startDate, lte: endDate },
      },
    });

    const realProduction = Number(production._sum.quantityProduced || 0);
    const hoursOperated = Number(production._sum.hoursOperated || 0);
    const maxCapacityPerHour = Number(machine.maxCapacity || 0);
    const efficiencyRate = Number(machine.efficiencyRate || 100);
    // Capacidad estándar = capacidad por hora × horas operadas × (eficiencia / 100)
    const standardCapacity = maxCapacityPerHour * hoursOperated * (efficiencyRate / 100);
    const performancePercentage = standardCapacity > 0 
      ? (realProduction / standardCapacity) * 100 
      : 0;

    return {
      performancePercentage: Number(performancePercentage.toFixed(2)),
      realProduction,
      standardCapacity,
      hoursOperated,
      period: `${startDate.toISOString().slice(0,10)} to ${endDate.toISOString().slice(0,10)}`,
    };
  }
}
