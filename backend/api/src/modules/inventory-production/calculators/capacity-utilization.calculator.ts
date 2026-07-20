import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CapacityUtilizationResult {
  utilizationPercentage: number;
  capacityUsed: number;
  capacityAvailable: number;
  hoursOperated: number;
  period: string;
}

@Injectable()
export class CapacityUtilizationCalculator {
  private readonly logger = new Logger(CapacityUtilizationCalculator.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el indicador de Capacidad de Producción Utilizada
   * Fórmula: (Capacidad Utilizada / Capacidad Disponible) * 100
   */
  async calculate(
    machineId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CapacityUtilizationResult> {
    this.logger.log(`Calculating Capacity Utilization for machine ${machineId}`);

    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: { name: true, maxCapacity: true },
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
        productionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const capacityUsed = Number(production._sum.quantityProduced || 0);
    const hoursOperated = Number(production._sum.hoursOperated || 0);
    // Capacidad disponible = capacidad máxima por hora × horas efectivamente operadas
    const maxCapacityPerHour = Number(machine.maxCapacity || 0);
    const capacityAvailable = maxCapacityPerHour * hoursOperated;
    const utilizationPercentage = capacityAvailable > 0 
      ? (capacityUsed / capacityAvailable) * 100 
      : 0;

    return {
      utilizationPercentage: Number(utilizationPercentage.toFixed(2)),
      capacityUsed,
      capacityAvailable,
      hoursOperated,
      period: `${startDate.toISOString().slice(0,10)} to ${endDate.toISOString().slice(0,10)}`,
    };
  }

  async getMonthlyData(machineId: string, year: number): Promise<any[]> {
    const results = [];
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);

      try {
        const stats = await this.calculate(machineId, monthStart, monthEnd);
        results.push({
          month: months[i],
          value: stats.utilizationPercentage,
          capacityUsed: stats.capacityUsed,
          capacityAvailable: stats.capacityAvailable,
          hoursOperated: stats.hoursOperated,
        });
      } catch (error) {
        results.push({
          month: months[i],
          value: 0,
          capacityUsed: 0,
          capacityAvailable: 0,
        });
      }
    }

    return results;
  }
}
