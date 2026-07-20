import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class WarehouseUtilizationCalculator {
  constructor(private prisma: PrismaService) {}

  /**
   * Índice de Utilización de Bodegas
   * (Área Utilizada / Área Disponible) * 100
   */
  async calculate(companyId: string, _startDate: Date, _endDate: Date) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        usableAreaM2: true,
        _count: {
          select: { locations: true }
        }
      }
    });

    if (warehouses.length === 0) return { percentage: 0, used: 0, total: 0 };

    // Para este cálculo usaremos la ocupación de locaciones como proxy de área
    const occupiedLocations = await this.prisma.location.count({
      where: {
        warehouse: { companyId },
        isOccupied: true
      }
    });

    const totalLocations = await this.prisma.location.count({
      where: {
        warehouse: { companyId }
      }
    });

    const percentage = totalLocations > 0 ? (occupiedLocations / totalLocations) * 100 : 0;

    return {
      percentage: Number(percentage.toFixed(2)),
      used: occupiedLocations,
      total: totalLocations,
      unit: 'locations'
    };
  }
}