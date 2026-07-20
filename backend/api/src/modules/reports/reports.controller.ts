import { Controller, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('download')
  async downloadReport(
    @Query('type') type: string,
    @Query('format') format: string,
    @Query('year') year: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const reportType = type || 'transport-vs-sales';
    const reportFormat = (format || 'pdf').toLowerCase() as 'pdf' | 'excel';
    const reportYear = parseInt(year) || new Date().getFullYear();
    const companyId = req.user.companyId;
    const userId = req.user.id;

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    switch (reportType) {
      case 'transport-vs-sales':
        buffer = await this.reportsService.generateTransportKpiReport(companyId, reportYear, userId, reportFormat);
        filename = `reporte-transporte-${reportYear}.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
        break;
      case 'kpi-summary':
        buffer = await this.reportsService.generateKpiSummaryReport(companyId, reportYear, userId, reportFormat);
        filename = `reporte-kpis-${reportYear}.xlsx`;
        break;
      case 'international-trade':
        buffer = await this.reportsService.generateInternationalTradeReport(companyId, reportYear, userId, reportFormat);
        filename = `reporte-comercio-exterior-${reportYear}.xlsx`;
        break;
      case 'purchase-orders':
        buffer = await this.reportsService.generatePurchaseOrdersReport(companyId, reportYear, userId, reportFormat);
        filename = `reporte-ordenes-compra-${reportYear}.xlsx`;
        break;
      default:
        buffer = await this.reportsService.generateTransportKpiReport(companyId, reportYear, userId, reportFormat);
        filename = `reporte-${reportType}-${reportYear}.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
    }

    contentType = reportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
