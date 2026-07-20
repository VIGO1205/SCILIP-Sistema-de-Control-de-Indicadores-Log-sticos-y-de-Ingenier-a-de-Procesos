import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PerfectDeliveriesCalculator } from './calculators/perfect-deliveries.calculator';
// ... rest of imports
import { OnTimeDeliveriesCalculator } from './calculators/on-time-deliveries.calculator';
import { CompleteDeliveriesCalculator } from './calculators/complete-deliveries.calculator';
import { DocumentationAccuracyCalculator } from './calculators/documentation-accuracy.calculator';
import { LogisticsCostVsSalesCalculator } from './calculators/logistics-cost-vs-sales.calculator';
import { LogisticsCostVsProfitCalculator } from './calculators/logistics-cost-vs-profit.calculator';
import { CediCostVsSalesCalculator } from './calculators/cedi-cost-vs-sales.calculator';

@Injectable()
export class CustomerServiceService {
  private readonly logger = new Logger(CustomerServiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfectDeliveriesCalculator: PerfectDeliveriesCalculator,
    private readonly onTimeDeliveriesCalculator: OnTimeDeliveriesCalculator,
    private readonly completeDeliveriesCalculator: CompleteDeliveriesCalculator,
    private readonly documentationAccuracyCalculator: DocumentationAccuracyCalculator,
    private readonly logisticsCostVsSalesCalculator: LogisticsCostVsSalesCalculator,
    private readonly logisticsCostVsProfitCalculator: LogisticsCostVsProfitCalculator,
    private readonly cediCostVsSalesCalculator: CediCostVsSalesCalculator,
  ) {}

  // --- CRUD Dispatches ---
  async getDispatches(companyId: string, filters?: any) {
    return this.prisma.dispatch.findMany({
      where: {
        companyId,
        ...(filters?.status ? { dispatchStatus: filters.status } : {}),
      },
      include: {
        customer: true,
        lines: { include: { product: true } },
      },
      orderBy: { dispatchDate: 'desc' },
    });
  }

  async createDispatch(companyId: string, data: any) {
    const { lines, customerId, orderReference, promisedDate, ...dispatchData } = data;
    return this.prisma.dispatch.create({
      data: {
        ...dispatchData,
        companyId,
        dispatchNumber: orderReference,
        customerId,
        promisedDate,
        lines: {
          create: lines.map((line: any) => ({
            productId: line.productId,
            quantityRequested: line.quantityRequested,
            quantityDispatched: line.quantityRequested, // Asumimos despacho completo inicial
          })),
        },
      },
    });
  }

  async updateDispatchStatus(id: string, status: string, details?: any) {
    return this.prisma.dispatch.update({
      where: { id },
      data: {
        dispatchStatus: status,
        ...details,
      },
    });
  }

  async deleteDispatch(id: string, companyId: string) {
    return this.prisma.dispatch.update({
      where: { id },
      data: { dispatchStatus: 'cancelled' },
    });
  }

  async getDispatchMonthlyData(companyId: string, year: number) {
    const results = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      
      const delivered = await this.prisma.dispatch.count({
        where: { companyId, dispatchDate: { gte: monthStart, lte: monthEnd }, dispatchStatus: 'delivered' },
      });
      const pending = await this.prisma.dispatch.count({
        where: { companyId, dispatchDate: { gte: monthStart, lte: monthEnd }, dispatchStatus: 'pending' },
      });
      const inTransit = await this.prisma.dispatch.count({
        where: { companyId, dispatchDate: { gte: monthStart, lte: monthEnd }, dispatchStatus: 'in_transit' },
      });
      const cancelled = await this.prisma.dispatch.count({
        where: { companyId, dispatchDate: { gte: monthStart, lte: monthEnd }, dispatchStatus: 'cancelled' },
      });
      
      results.push({ month: months[i], delivered, pending, inTransit, cancelled, total: delivered + pending + inTransit + cancelled });
    }
    
    return results;
  }

  async calculatePerfectDeliveries(companyId: string, startDate: Date, endDate: Date) {
    return this.perfectDeliveriesCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateOnTimeDeliveries(companyId: string, startDate: Date, endDate: Date) {
    return this.onTimeDeliveriesCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateCompleteDeliveries(companyId: string, startDate: Date, endDate: Date) {
    return this.completeDeliveriesCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateDocumentationAccuracy(companyId: string, startDate: Date, endDate: Date) {
    return this.documentationAccuracyCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateLogisticsCostVsSales(companyId: string, startDate: Date, endDate: Date) {
    return this.logisticsCostVsSalesCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateLogisticsCostVsProfit(companyId: string, startDate: Date, endDate: Date) {
    return this.logisticsCostVsProfitCalculator.calculate(companyId, startDate, endDate);
  }

  async calculateCediCostVsSales(companyId: string, startDate: Date, endDate: Date) {
    return this.cediCostVsSalesCalculator.calculate(companyId, startDate, endDate);
  }
}
