import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { ExcelGeneratorService } from './excel/excel-generator.service';
import { TransportService } from '../transport/transport.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly excelGenerator: ExcelGeneratorService,
    private readonly transportService: TransportService,
  ) {}

  // ── TRANSPORTE VS VENTAS ──
  async generateTransportKpiReport(companyId: string, year: number, userId: string, format: 'pdf' | 'excel' = 'pdf') {
    this.logger.log(`Generating Transport KPI Report for company ${companyId}, year ${year}, format ${format}`);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const monthlyData = await this.transportService.getTransportVsSalesMonthly(companyId, year);

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });

    if (format === 'pdf') {
      const reportData = {
        year,
        monthlyData: monthlyData.map(d => ({
          month: d.month,
          transportCost: d.transportCost,
          totalSales: d.totalSales,
          percentage: d.percentage,
        })),
        summary: {
          totalTransportCost: monthlyData.reduce((acc, d) => acc + d.transportCost, 0),
          totalSales: monthlyData.reduce((acc, d) => acc + d.totalSales, 0),
          averagePercentage: monthlyData.length > 0
            ? monthlyData.reduce((acc, d) => acc + d.percentage, 0) / monthlyData.length
            : 0,
          trend: this.calculateTrend(monthlyData) as 'up' | 'down' | 'stable',
        },
        companyInfo: { name: company?.legalName || 'SCILIP Logistics', logo: company?.logoUrl || '', address: company?.address || '' },
        generatedBy: user?.fullName || 'Sistema SCILIP',
      };
      return this.pdfGenerator.generateTransportVsSalesReport(reportData);
    }

    // Excel
    return this.excelGenerator.generateReport({
      title: 'Reporte Transporte vs Ventas',
      subtitle: `Año ${year}`,
      companyName: company?.legalName || 'SCILIP Logistics',
      generatedBy: user?.fullName || 'Sistema SCILIP',
      generatedAt: new Date().toLocaleString('es-CO'),
      sheetName: 'Transporte vs Ventas',
      columns: [
        { header: 'Mes', key: 'month', width: 12 },
        { header: 'Costo Transporte (USD)', key: 'transportCost', width: 22 },
        { header: 'Ventas Totales (USD)', key: 'totalSales', width: 22 },
        { header: 'Porcentaje (%)', key: 'percentage', width: 18 },
      ],
      rows: monthlyData.map(d => ({
        month: d.month,
        transportCost: d.transportCost,
        totalSales: d.totalSales,
        percentage: Number(d.percentage.toFixed(2)),
      })),
      summary: [
        { label: 'Costo Total Transporte', value: `$${monthlyData.reduce((acc, d) => acc + d.transportCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Ventas Totales', value: `$${monthlyData.reduce((acc, d) => acc + d.totalSales, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Promedio %', value: `${monthlyData.length > 0 ? (monthlyData.reduce((acc, d) => acc + d.percentage, 0) / monthlyData.length).toFixed(2) : 0}%` },
      ],
    });
  }

  // ── KPIs LOGÍSTICOS ──
  async generateKpiSummaryReport(companyId: string, year: number, userId: string, format: 'pdf' | 'excel' = 'pdf') {
    this.logger.log(`Generating KPI Summary Report for company ${companyId}, year ${year}, format ${format}`);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const kpis = await this.prisma.kpiDefinition.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { code: 'asc' },
    });

    const kpiValues = await this.prisma.kpiValue.findMany({
      where: { companyId, periodDate: { gte: startDate, lte: endDate } },
      orderBy: { periodDate: 'desc' },
    });

    const latestValues = new Map<number, any>();
    kpiValues.forEach((v) => {
      if (!latestValues.has(v.kpiId)) latestValues.set(v.kpiId, v);
    });

    const rows = kpis.map((kpi) => {
      const latest = latestValues.get(kpi.id);
      return {
        code: kpi.code,
        name: kpi.name,
        category: kpi.category?.name || '-',
        value: latest?.actualValue ?? '-',
        unit: kpi.unit || '',
        target: kpi.targetValue || '-',
        status: latest?.status || '-',
      };
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });

    if (format === 'excel') {
      return this.excelGenerator.generateReport({
        title: 'Resumen de KPIs Logísticos',
        subtitle: `Año ${year}`,
        companyName: company?.legalName || 'SCILIP Logistics',
        generatedBy: user?.fullName || 'Sistema SCILIP',
        generatedAt: new Date().toLocaleString('es-CO'),
        sheetName: 'KPIs',
        columns: [
          { header: 'Código', key: 'code', width: 18 },
          { header: 'Nombre', key: 'name', width: 40 },
          { header: 'Categoría', key: 'category', width: 20 },
          { header: 'Valor', key: 'value', width: 15 },
          { header: 'Unidad', key: 'unit', width: 12 },
          { header: 'Meta', key: 'target', width: 12 },
          { header: 'Estado', key: 'status', width: 12 },
        ],
        rows,
        summary: [
          { label: 'Total KPIs Activos', value: kpis.length },
          { label: 'KPIs con Datos', value: kpiValues.length },
        ],
      });
    }

    // PDF placeholder — usamos Excel para este reporte si no hay plantilla HBS
    return this.excelGenerator.generateReport({
      title: 'Resumen de KPIs Logísticos',
      subtitle: `Año ${year}`,
      companyName: company?.legalName || 'SCILIP Logistics',
      generatedBy: user?.fullName || 'Sistema SCILIP',
      generatedAt: new Date().toLocaleString('es-CO'),
      sheetName: 'KPIs',
      columns: [
        { header: 'Código', key: 'code', width: 18 },
        { header: 'Nombre', key: 'name', width: 40 },
        { header: 'Categoría', key: 'category', width: 20 },
        { header: 'Valor', key: 'value', width: 15 },
        { header: 'Unidad', key: 'unit', width: 12 },
        { header: 'Meta', key: 'target', width: 12 },
        { header: 'Estado', key: 'status', width: 12 },
      ],
      rows,
      summary: [
        { label: 'Total KPIs Activos', value: kpis.length },
        { label: 'KPIs con Datos', value: kpiValues.length },
      ],
    });
  }

  // ── COMERCIO EXTERIOR ──
  async generateInternationalTradeReport(companyId: string, year: number, userId: string, format: 'pdf' | 'excel' = 'pdf') {
    this.logger.log(`Generating International Trade Report for company ${companyId}, year ${year}, format ${format}`);

    const operations = await this.prisma.importExportRecord.findMany({
      where: { companyId, operationDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
      include: { product: true, supplier: true },
      orderBy: { operationDate: 'desc' },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });

    const rows = operations.map((op) => ({
      date: new Date(op.operationDate).toLocaleDateString('es-CO'),
      type: op.operationType === 'IMPORT' ? 'Importación' : 'Exportación',
      product: op.product?.name || '-',
      partner: op.operationType === 'IMPORT' ? op.supplier?.name || '-' : op.customerName || '-',
      quantity: op.quantity,
      totalCost: Number(op.totalCostUsd),
      status: op.status || '-',
    }));

    const totalImport = rows.filter((r) => r.type === 'Importación').reduce((s, r) => s + r.totalCost, 0);
    const totalExport = rows.filter((r) => r.type === 'Exportación').reduce((s, r) => s + r.totalCost, 0);

    return this.excelGenerator.generateReport({
      title: 'Reporte Comercio Exterior',
      subtitle: `Año ${year}`,
      companyName: company?.legalName || 'SCILIP Logistics',
      generatedBy: user?.fullName || 'Sistema SCILIP',
      generatedAt: new Date().toLocaleString('es-CO'),
      sheetName: 'Comercio Exterior',
      columns: [
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Tipo', key: 'type', width: 14 },
        { header: 'Producto', key: 'product', width: 28 },
        { header: 'Proveedor/Cliente', key: 'partner', width: 28 },
        { header: 'Cantidad', key: 'quantity', width: 12 },
        { header: 'Costo Total (USD)', key: 'totalCost', width: 20 },
        { header: 'Estado', key: 'status', width: 14 },
      ],
      rows,
      summary: [
        { label: 'Total Importaciones (USD)', value: `$${totalImport.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Total Exportaciones (USD)', value: `$${totalExport.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Balance (USD)', value: `$${(totalExport - totalImport).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Operaciones Totales', value: operations.length },
      ],
    });
  }

  // ── ÓRDENES DE COMPRA ──
  async generatePurchaseOrdersReport(companyId: string, year: number, userId: string, format: 'pdf' | 'excel' = 'pdf') {
    this.logger.log(`Generating Purchase Orders Report for company ${companyId}, year ${year}, format ${format}`);

    const orders = await this.prisma.purchaseOrder.findMany({
      where: { companyId, orderDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
      include: { supplier: true, lines: { include: { product: true } } },
      orderBy: { orderDate: 'desc' },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });

    const rows = orders.map((o) => ({
      poNumber: o.poNumber,
      date: new Date(o.orderDate).toLocaleDateString('es-CO'),
      supplier: o.supplier?.name || '-',
      status: o.status,
      totalAmount: Number(o.totalAmount),
      items: o.lines.length,
    }));

    const totalAmount = rows.reduce((s, r) => s + r.totalAmount, 0);

    return this.excelGenerator.generateReport({
      title: 'Reporte Órdenes de Compra',
      subtitle: `Año ${year}`,
      companyName: company?.legalName || 'SCILIP Logistics',
      generatedBy: user?.fullName || 'Sistema SCILIP',
      generatedAt: new Date().toLocaleString('es-CO'),
      sheetName: 'Órdenes de Compra',
      columns: [
        { header: 'Nº OC', key: 'poNumber', width: 18 },
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Proveedor', key: 'supplier', width: 30 },
        { header: 'Estado', key: 'status', width: 14 },
        { header: 'Monto Total (USD)', key: 'totalAmount', width: 20 },
        { header: 'Ítems', key: 'items', width: 10 },
      ],
      rows,
      summary: [
        { label: 'Total Órdenes', value: orders.length },
        { label: 'Monto Total (USD)', value: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Promedio por Orden', value: `$${orders.length > 0 ? (totalAmount / orders.length).toFixed(2) : '0.00'}` },
      ],
    });
  }

  private calculateTrend(data: any[]): string {
    if (data.length < 2) return 'stable';
    const last = data[data.length - 1].percentage;
    const prev = data[data.length - 2].percentage;
    if (last > prev + 0.1) return 'up';
    if (last < prev - 0.1) return 'down';
    return 'stable';
  }
}
