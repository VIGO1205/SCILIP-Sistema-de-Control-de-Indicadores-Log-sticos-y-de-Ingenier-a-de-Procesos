import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface InventoryAccuracyResult {
  accuracyPercentage: number;
  totalDifference: number;
  totalInventoryValue: number;
  message?: string;
}

@Injectable()
export class InventoryAccuracyCalculator {
  private readonly logger = new Logger(InventoryAccuracyCalculator.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * Calcula el indicador de Exactitud en Inventarios
   * Fórmula del PDF: (Valor diferencia / Valor total inventario) * 100
   */
  async calculate(companyId: string, startDate: Date, endDate: Date): Promise<InventoryAccuracyResult> {
    this.logger.log(`Calculating Inventory Accuracy KPI for company ${companyId} from ${startDate} to ${endDate}`);

    // Prisma aggregate for sums
    const records = await this.prisma.physicalInventory.findMany({
      where: {
        companyId,
        inventoryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
      },
    });

    let totalDifference = 0;
    let totalInventoryValue = 0;

    for (const record of records) {
      totalDifference += Math.abs(Number(record.differenceValue || 0));
      totalInventoryValue += Number(record.theoreticalQuantity) * Number(record.product.unitCost || 0);
    }

    if (totalInventoryValue === 0) {
      return {
        accuracyPercentage: 0,
        totalDifference: 0,
        totalInventoryValue: 0,
        message: 'No se encontraron datos de inventario para el período seleccionado.',
      };
    }

    const accuracyPercentage = (totalDifference / totalInventoryValue) * 100;

    return {
      accuracyPercentage: Number(accuracyPercentage.toFixed(2)),
      totalDifference,
      totalInventoryValue,
    };
  }

  /**
   * Obtiene series de tiempo para gráficos
   */
  async getTimeSeries(startDate: Date, endDate: Date): Promise<any[]> {
    const records = await this.prisma.physicalInventory.findMany({
      where: {
        inventoryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        inventoryDate: 'asc',
      },
    });

    // Group by month manually since Prisma aggregate by date parts is limited
    const grouped = records.reduce((acc, record) => {
      const month = record.inventoryDate.getMonth() + 1;
      if (!acc[month]) {
        acc[month] = { totalDifference: 0, totalInventoryValue: 0 };
      }
      acc[month].totalDifference += Math.abs(Number(record.differenceValue || 0));
      acc[month].totalInventoryValue += Number(record.theoreticalQuantity) * Number(record.product.unitCost || 0);
      return acc;
    }, {} as Record<number, { totalDifference: number; totalInventoryValue: number }>);

    return Object.entries(grouped).map(([month, data]) => {
      const accuracyPercentage = data.totalInventoryValue > 0 
        ? (data.totalDifference / data.totalInventoryValue) * 100 
        : 0;

      return {
        month: parseInt(month),
        accuracyPercentage: Number(accuracyPercentage.toFixed(2)),
        totalDifference: data.totalDifference,
        totalInventoryValue: data.totalInventoryValue,
      };
    });
  }
}
