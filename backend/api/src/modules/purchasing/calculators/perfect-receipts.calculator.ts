import { Injectable, Logger } from '@nestjs/common'; 
 import { PrismaService } from '../../../prisma/prisma.service'; 
 
 export interface PerfectReceiptsResult { 
   period: string; 
   totalOrdersReceived: number; 
   rejectedOrders: number; 
   rejectedPercentage: number; 
   rejectedBySupplier: Array<{ 
     supplierId: string; 
     supplierName: string; 
     rejectedOrders: number; 
     totalOrders: number; 
     rejectionRate: number; 
   }>; 
   topRejectionReasons: Array<{ 
     reason: string; 
     count: number; 
   }>; 
 } 
 
 @Injectable() 
 export class PerfectReceiptsCalculator { 
   private readonly logger = new Logger(PerfectReceiptsCalculator.name); 
 
   constructor( 
     private prisma: PrismaService, 
   ) {} 
 
   /** 
    * Calcula el indicador de Entregas Perfectamente Recibidas 
    * Fórmula: (Pedidos rechazados / Total órdenes de compra recibidas) * 100 
    */ 
   async calculate(
     companyId: string,
     startDate: Date,
     endDate: Date,
     supplierId?: string,
   ): Promise<PerfectReceiptsResult> {
     this.logger.log(`Calculating Perfect Receipts KPI for company ${companyId} from ${startDate} to ${endDate}`); 
 
     // Obtener todas las órdenes recibidas en el período usando Prisma
     const receivedOrders = await this.prisma.purchaseOrder.findMany({
       where: {
         companyId,
         actualDeliveryDate: {
           gte: startDate,
           lte: endDate,
         },
         ...(supplierId ? { supplierId } : {}),
       },
       include: {
         supplier: true,
       },
     });
 
     const totalOrdersReceived = receivedOrders.length; 
     
     // Contar órdenes rechazadas (status = 'rejected' o con líneas rechazadas) 
     const rejectedOrders = receivedOrders.filter(order => 
       order.status === 'rejected' || 
       order.rejectionReason !== null 
     ); 
     
     const rejectedCount = rejectedOrders.length; 
     const rejectedPercentage = totalOrdersReceived > 0 
       ? (rejectedCount / totalOrdersReceived) * 100 
       : 0; 
 
     // Calcular desglose por proveedor 
     const rejectedBySupplier = await this.calculateBySupplier(companyId, startDate, endDate, supplierId); 
     
     // Top razones de rechazo 
     const topRejectionReasons = await this.getTopRejectionReasons(companyId, startDate, endDate); 
 
     return { 
       period: `${startDate.toISOString().slice(0,7)} to ${endDate.toISOString().slice(0,7)}`, 
       totalOrdersReceived, 
       rejectedOrders: rejectedCount, 
       rejectedPercentage: Number(rejectedPercentage.toFixed(2)), 
       rejectedBySupplier, 
       topRejectionReasons, 
     }; 
   } 
 
   private async calculateBySupplier(companyId: string, startDate: Date, endDate: Date, supplierId?: string) {
     const result = await this.prisma.purchaseOrder.groupBy({
       by: ['supplierId'],
       where: {
         companyId,
         actualDeliveryDate: {
           gte: startDate,
           lte: endDate,
         },
         ...(supplierId ? { supplierId } : {}),
       },
       _count: {
         id: true,
       },
     });

     // Para obtener los nombres de los proveedores y calcular rechazos, 
     // Prisma groupBy no soporta joins complejos o filtrado por campos calculados directamente en el mismo query de forma sencilla.
     // Haremos un fetch de los proveedores involucrados.
     
     const suppliers = await this.prisma.supplier.findMany({
       where: {
         id: { in: result.map(r => r.supplierId) }
       }
     });

     const rejectedCounts = await this.prisma.purchaseOrder.groupBy({
       by: ['supplierId'],
       where: {
         companyId,
         actualDeliveryDate: {
           gte: startDate,
           lte: endDate,
         },
         OR: [
           { status: 'rejected' },
           { rejectionReason: { not: null } }
         ],
         ...(supplierId ? { supplierId } : {}),
       },
       _count: {
         id: true,
       },
     });

     return result.map(r => {
       const supplier = suppliers.find(s => s.id === r.supplierId);
       const rejected = rejectedCounts.find(rc => rc.supplierId === r.supplierId)?._count.id || 0;
       const total = r._count.id;
       return {
         supplierId: r.supplierId,
         supplierName: supplier?.name || 'Unknown',
         rejectedOrders: rejected,
         totalOrders: total,
         rejectionRate: Number(((rejected / total) * 100).toFixed(2)),
       };
     });
   }

   private async getTopRejectionReasons(companyId: string, startDate: Date, endDate: Date) {
     const result = await this.prisma.purchaseOrder.groupBy({
       by: ['rejectionReason'],
       where: {
         companyId,
         actualDeliveryDate: {
           gte: startDate,
           lte: endDate,
         },
         rejectionReason: { not: null },
       },
       _count: {
         id: true,
       },
       orderBy: {
         _count: {
           id: 'desc',
         },
       },
       take: 5,
     });

     return result.map(r => ({
       reason: r.rejectionReason!,
       count: r._count.id,
     }));
   }
 
   /** 
    * Calcula series de tiempo mensuales para gráficos 
    */ 
   async getTimeSeries(
     companyId: string,
     startDate: Date, 
     endDate: Date, 
     supplierId?: string, 
   ): Promise<Array<{ month: string; value: number; totalOrders: number; rejectedOrders: number }>> { 
     const results = []; 
     let currentDate = new Date(startDate); 
     
     while (currentDate <= endDate) { 
       const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); 
       const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); 
       
       const stats = await this.prisma.purchaseOrder.aggregate({ 
         _count: { 
           id: true, 
         }, 
         where: {
           companyId,
           actualDeliveryDate: { 
             gte: monthStart, 
             lte: monthEnd, 
           }, 
           ...(supplierId ? { supplierId } : {}), 
         }, 
       }); 
 
       const rejectedStats = await this.prisma.purchaseOrder.count({ 
         where: {
           companyId,
           actualDeliveryDate: { 
             gte: monthStart, 
             lte: monthEnd, 
           }, 
           OR: [ 
             { status: 'rejected' }, 
             { rejectionReason: { not: null } } 
           ], 
           ...(supplierId ? { supplierId } : {}), 
         }, 
       }); 
       
       const totalOrders = stats._count.id; 
       const rejectedOrders = rejectedStats; 
       const value = totalOrders > 0 ? (rejectedOrders / totalOrders) * 100 : 0; 
       
       results.push({ 
         month: monthStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }), 
         value: Number(value.toFixed(2)), 
         totalOrders, 
         rejectedOrders, 
       }); 
       
       currentDate.setMonth(currentDate.getMonth() + 1); 
     } 
     
     return results; 
   } 
 } 
