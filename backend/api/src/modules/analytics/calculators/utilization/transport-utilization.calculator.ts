import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class TransportUtilizationCalculator {
  constructor(private prisma: PrismaService) {}

  /**
   * Índice de Utilización de Transporte
   * (Vehículos en Operación / Total Vehículos) * 100
   */
  async calculate(companyId: string, _startDate: Date, _endDate: Date) {
    const totalVehicles = await this.prisma.vehicle.count({
      where: { companyId, status: 'active' }
    });

    const activeVehicles = await this.prisma.vehicle.count({
      where: { 
        companyId, 
        status: 'active',
        // status: 'IN_USE' // Asumiendo este enum o similar
      }
    });

    const percentage = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

    return {
      percentage: Number(percentage.toFixed(2)),
      used: activeVehicles,
      total: totalVehicles,
      unit: 'vehicles'
    };
  }
}