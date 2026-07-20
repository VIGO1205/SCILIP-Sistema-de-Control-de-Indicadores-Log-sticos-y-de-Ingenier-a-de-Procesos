import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException } from '@nestjs/common'; 
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { Roles } from '../../common/decorators/roles.decorator'; 
import { IngestService } from './ingest.service'; 
 
 @Controller('ingest') 
 @UseGuards(JwtAuthGuard, RolesGuard) 
 export class IngestController { 
   constructor(private ingestService: IngestService) {} 
 
   @Post('purchase-orders/csv') 
   @Roles('admin', 'purchasing_manager')
   @UseInterceptors(FileInterceptor('file'))
   async ingestPurchaseOrdersCsv(
     @UploadedFile() file: Express.Multer.File,
     @Req() req: any,
     @Body('companyId') bodyCompanyId?: string,
   ) { 
     if (!file) {
       throw new BadRequestException('CSV file is required');
     }
 
     // Usually companyId and userId come from the JWT token (req.user)
     // We fallback to body.companyId if req.user doesn't have it (depending on how auth is setup)
     const companyId = req.user?.companyId || bodyCompanyId;
     const userId = req.user?.id || req.user?.sub;
 
     if (!companyId || !userId) {
       throw new BadRequestException('Company ID and User ID could not be determined. Check your token or request body.');
     }
 
     return this.ingestService.processPurchaseOrders(companyId, userId, file.buffer); 
   } 
 
   @Post('sales') 
   @Roles('admin', 'general_manager') 
   async ingestSales(@Body() data: { 
     sales: any[]; 
     source: string; 
   }) { 
     return this.ingestService.processSales(data.sales, data.source); 
   } 
 
   @Post('inventory') 
   @Roles('admin', 'operations_manager') 
   async ingestInventory(@Body() data: { 
     movements: any[]; 
     source: string; 
   }) { 
     return this.ingestService.processInventoryMovements(data.movements, data.source); 
   } 
 }
