import { Injectable, Logger } from '@nestjs/common'; 
 import * as puppeteer from 'puppeteer'; 
 import * as Handlebars from 'handlebars'; 
 import { readFileSync } from 'fs'; 
 import { join } from 'path'; 
  
 @Injectable() 
 export class PdfGeneratorService { 
   private readonly logger = new Logger(PdfGeneratorService.name); 
    
   async generateTransportVsSalesReport(data: { 
     year: number; 
     monthlyData: Array<{ 
       month: string; 
       transportCost: number; 
       totalSales: number; 
       percentage: number; 
     }>; 
     summary: { 
       totalTransportCost: number; 
       totalSales: number; 
       averagePercentage: number; 
       trend: 'up' | 'down' | 'stable'; 
     }; 
     companyInfo: { 
       name: string; 
       logo: string; 
       address: string; 
     }; 
     generatedBy: string; 
   }): Promise<Buffer> { 
     this.logger.log(`Generating PDF report for Transport vs Sales KPI - Year ${data.year}`); 
      
     // 1. Cargar template HTML 
     const templateHtml = readFileSync( 
       join(__dirname, 'templates', 'transport-vs-sales.hbs'), 
       'utf8' 
     ); 
      
     // 2. Registrar helpers de Handlebars 
     if (!Handlebars.helpers.formatCurrency) {
       Handlebars.registerHelper('formatCurrency', (value: number) => { 
         return new Intl.NumberFormat('es-CO', { 
           style: 'currency', 
           currency: 'COP', 
           minimumFractionDigits: 0, 
         }).format(value); 
       }); 
     }
      
     if (!Handlebars.helpers.formatPercentage) {
       Handlebars.registerHelper('formatPercentage', (value: number) => { 
         return `${value.toFixed(1)}%`; 
       }); 
     }
      
     if (!Handlebars.helpers.getTrendIcon) {
       Handlebars.registerHelper('getTrendIcon', (trend: string) => { 
         if (trend === 'up') return '📈'; 
         if (trend === 'down') return '📉'; 
         return '➡️'; 
       }); 
     }
      
     if (!Handlebars.helpers.getTrendColor) {
       Handlebars.registerHelper('getTrendColor', (trend: string) => { 
         if (trend === 'up') return '#ef4444'; // red 
         if (trend === 'down') return '#10b981'; // green 
         return '#6b7280'; // gray 
       }); 
     }

     if (!Handlebars.helpers.eq) {
       Handlebars.registerHelper('eq', (a, b) => a === b);
     }

     if (!Handlebars.helpers.gt) {
       Handlebars.registerHelper('gt', (a, b) => a > b);
     }      
     // 3. Compilar template 
     const template = Handlebars.compile(templateHtml); 
      
     // 4. Generar gráfico como imagen base64 
     const chartImage = await this.generateChartImage(data.monthlyData); 
      
     // 5. Renderizar HTML con datos 
     const html = template({ 
       ...data, 
       generatedAt: new Date().toLocaleString('es-ES'), 
       chartImage, 
     }); 
      
     // 6. Lanzar Puppeteer y generar PDF 
     const browser = await puppeteer.launch({ 
       headless: true, 
       args: ['--no-sandbox', '--disable-setuid-sandbox'], 
     }); 
      
     const page = await browser.newPage(); 
     await page.setContent(html, { waitUntil: 'networkidle0' }); 
      
     // Configurar tamaño de página 
     await page.emulateMediaType('screen'); 
      
     const pdf = await page.pdf({ 
       format: 'A4', 
       printBackground: true, 
       margin: { 
         top: '20mm', 
         bottom: '20mm', 
         left: '15mm', 
         right: '15mm', 
       }, 
       headerTemplate: '<div style="font-size: 8px; text-align: center; width: 100%;">Sistema de Gestión Logística - Reporte KPI</div>', 
       footerTemplate: '<div style="font-size: 8px; text-align: center; width: 100%;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>', 
       displayHeaderFooter: true, 
     }); 
      
     await browser.close(); 
      
     return Buffer.from(pdf); 
   } 
    
   private async generateChartImage(monthlyData: any[]): Promise<string> { 
     const browser = await puppeteer.launch({ headless: true }); 
     const page = await browser.newPage(); 
      
     // HTML con Chart.js para renderizar el gráfico 
     const chartHtml = ` 
       <!DOCTYPE html> 
       <html> 
       <head> 
         <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> 
         <style> 
           body { margin: 0; padding: 20px; } 
           canvas { width: 800px; height: 400px; } 
         </style> 
       </head> 
       <body> 
         <canvas id="myChart"></canvas> 
         <script> 
           const ctx = document.getElementById('myChart').getContext('2d'); 
           new Chart(ctx, { 
             type: 'line', 
             data: { 
               labels: ${JSON.stringify(monthlyData.map(d => d.month))}, 
               datasets: [ 
                 { 
                   label: 'Costo Transporte vs Ventas (%)', 
                   data: ${JSON.stringify(monthlyData.map(d => d.percentage))}, 
                   borderColor: 'rgb(59, 130, 246)', 
                   backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                   tension: 0.3, 
                   fill: true 
                 } 
               ] 
             }, 
             options: { 
               responsive: true, 
               plugins: { 
                 tooltip: { 
                   callbacks: { 
                     label: function(context) { 
                       return context.parsed.y.toFixed(1) + '%'; 
                     } 
                   } 
                 } 
               }, 
               scales: { 
                 y: { 
                   title: { display: true, text: 'Porcentaje (%)' }, 
                   min: 0, 
                   max: 10 
                 } 
               } 
             } 
           }); 
         </script> 
       </body> 
       </html> 
     `; 
      
     await page.setContent(chartHtml); 
     // Reemplazamos waitForTimeout (deprecado) por una espera manual o similar si fuera necesario, 
     // pero para screenshots de Chart.js suele bastar con esperar a que el loop de render termine.
     await new Promise(resolve => setTimeout(resolve, 1000)); 
      
     const element = await page.$('#myChart'); 
     const screenshot = await element!.screenshot({ type: 'png' }); 
      
     await browser.close(); 
      
     return `data:image/png;base64,${screenshot.toString('base64')}`; 
   } 
 } 
