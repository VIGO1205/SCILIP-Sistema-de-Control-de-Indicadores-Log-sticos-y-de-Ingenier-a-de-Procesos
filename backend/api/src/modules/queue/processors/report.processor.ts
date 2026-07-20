import { Processor, WorkerHost } from '@nestjs/bullmq'; 
 import { Job } from 'bullmq'; 
 import { PdfGeneratorService } from '../../reports/pdf/pdf-generator.service'; 
 import { TransportService } from '../../transport/transport.service'; 
 import { EmailService } from '../../notifications/email/email.service'; 
  
 @Processor('reports') 
 export class ReportProcessor extends WorkerHost { 
   constructor( 
     private pdfGenerator: PdfGeneratorService, 
     private transportService: TransportService, 
     private emailService: EmailService, 
   ) { 
     super(); 
   } 
    
   async process(job: Job<any, any, string>): Promise<any> { 
     switch (job.name) { 
       case 'transport-vs-sales-report': 
         await this.generateTransportVsSalesReport(job.data); 
         break; 
       default: 
         throw new Error(`Unknown job: ${job.name}`); 
     } 
   } 
    
  private async generateTransportVsSalesReport(data: {
    companyId: string;
    year: number;
    recipients: string[];
    scheduled: boolean;
  }) {
     // Obtener datos del KPI 
    const monthlyData = await this.transportService.getTransportVsSalesMonthly(data.companyId, data.year);
    const summary = await this.transportService.getTransportVsSalesSummary(data.companyId, data.year);
      
     // Generar PDF 
     const pdfBuffer = await this.pdfGenerator.generateTransportVsSalesReport({ 
       year: data.year, 
       monthlyData, 
       summary, 
       companyInfo: { 
         name: 'Logistics Corp S.A.S', 
         logo: 'https://example.com/logo.png', 
         address: 'Calle 123, Bogotá, Colombia', 
       }, 
       generatedBy: 'Sistema Automatizado', 
     }); 
      
     // Enviar por email 
     if (data.recipients.length > 0) { 
       await this.emailService.sendReport({ 
         to: data.recipients, 
         subject: `Reporte KPI - Costo Transporte vs Ventas ${data.year}`, 
         body: 'Adjunto encontrará el reporte mensual del indicador de costo de transporte versus ventas.', 
         attachments: [{ 
           filename: `reporte-transporte-vs-ventas-${data.year}.pdf`, 
           content: pdfBuffer, 
         }], 
       }); 
     } 
      
     return { success: true, generatedAt: new Date() }; 
   } 
 } 
