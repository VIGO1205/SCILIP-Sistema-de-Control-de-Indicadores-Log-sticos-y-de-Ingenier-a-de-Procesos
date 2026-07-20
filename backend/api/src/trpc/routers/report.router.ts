import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const reportRouter = router({
  // Listar reportes disponibles
  getAvailableReports: protectedProcedure
    .query(async ({ ctx }) => {
      const currentYear = new Date().getFullYear();
      return [
        {
          id: 'transport-vs-sales',
          name: 'Transporte vs Ventas',
          description: 'Análisis mensual del costo de transporte en relación a las ventas totales. Incluye tendencias y porcentajes.',
          category: 'Transporte',
          icon: 'Truck',
          formats: ['pdf', 'excel'],
          defaultYear: currentYear,
        },
        {
          id: 'kpi-summary',
          name: 'Resumen de KPIs Logísticos',
          description: 'Consolidado de todos los indicadores clave de desempeño del sistema con valores actuales, metas y estados.',
          category: 'KPIs',
          icon: 'BarChart3',
          formats: ['excel'],
          defaultYear: currentYear,
        },
        {
          id: 'international-trade',
          name: 'Comercio Exterior',
          description: 'Detalle de importaciones y exportaciones con costos, cantidades, estados y balance comercial.',
          category: 'Comercio Exterior',
          icon: 'Globe',
          formats: ['excel'],
          defaultYear: currentYear,
        },
        {
          id: 'purchase-orders',
          name: 'Órdenes de Compra',
          description: 'Listado completo de órdenes de compra del período con proveedores, montos, estados e ítems.',
          category: 'Compras',
          icon: 'ShoppingCart',
          formats: ['excel'],
          defaultYear: currentYear,
        },
      ];
    }),

  // Obtener historial de reportes generados
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.prisma.reportHistory.findMany({
        orderBy: { generatedAt: 'desc' },
        take: input.limit,
        include: {
          report: {
            select: { name: true, format: true },
          },
        },
      });

      return history.map((h) => {
        let meta: any = {};
        try { meta = JSON.parse(h.fileUrl || '{}'); } catch {}
        return {
          id: h.id,
          name: meta.name || h.report?.name || 'Reporte Generado',
          format: meta.format || h.report?.format || 'pdf',
          generatedAt: h.generatedAt,
          status: h.status,
          fileUrl: h.fileUrl,
          fileSizeBytes: h.fileSizeBytes,
          recipientCount: h.recipientCount,
        };
      });
    }),

  // Eliminar un registro del historial
  deleteHistory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.reportHistory.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  // Descargar reporte (PDF o Excel) como base64
  downloadReport: protectedProcedure
    .input(z.object({
      type: z.string().min(1),
      format: z.enum(['pdf', 'excel']),
      year: z.number().int().min(2000).max(2100).default(new Date().getFullYear()),
    }))
    .mutation(async ({ ctx, input }) => {
      const reportType = input.type;
      const reportFormat = input.format;
      const reportYear = input.year;
      const companyId = ctx.user.companyId;
      const userId = ctx.user.id;

      let buffer: Buffer;
      let filename: string;
      let contentType: string;

      switch (reportType) {
        case 'transport-vs-sales':
          buffer = await ctx.reportsService.generateTransportKpiReport(companyId, reportYear, userId, reportFormat);
          filename = `reporte-transporte-${reportYear}.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
          break;
        case 'kpi-summary':
          buffer = await ctx.reportsService.generateKpiSummaryReport(companyId, reportYear, userId, reportFormat);
          filename = `reporte-kpis-${reportYear}.xlsx`;
          break;
        case 'international-trade':
          buffer = await ctx.reportsService.generateInternationalTradeReport(companyId, reportYear, userId, reportFormat);
          filename = `reporte-comercio-exterior-${reportYear}.xlsx`;
          break;
        case 'purchase-orders':
          buffer = await ctx.reportsService.generatePurchaseOrdersReport(companyId, reportYear, userId, reportFormat);
          filename = `reporte-ordenes-compra-${reportYear}.xlsx`;
          break;
        default:
          buffer = await ctx.reportsService.generateTransportKpiReport(companyId, reportYear, userId, reportFormat);
          filename = `reporte-${reportType}-${reportYear}.${reportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      }

      contentType = reportFormat === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Guardar en historial de reportes
      await ctx.prisma.reportHistory.create({
        data: {
          status: 'completed',
          fileSizeBytes: buffer.length,
          generatedAt: new Date(),
          fileUrl: JSON.stringify({ type: reportType, format: reportFormat, year: reportYear, name: filename }),
        },
      });

      return {
        base64: buffer.toString('base64'),
        filename,
        contentType,
      };
    }),
});
