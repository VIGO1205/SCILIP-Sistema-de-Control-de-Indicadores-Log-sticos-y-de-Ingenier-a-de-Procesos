import { Module } from '@nestjs/common'; 
 import { PurchasingService } from './purchasing.service'; 
 import { PurchasingController } from './purchasing.controller'; 
 import { PerfectReceiptsCalculator } from './calculators/perfect-receipts.calculator'; 
 import { SupplierCertificationCalculator } from './calculators/supplier-certification.calculator';
 import { OrderQualityCalculator } from './calculators/order-quality.calculator';
 import { PurchaseVolumeCalculator } from './calculators/purchase-volume.calculator';
 
 @Module({ 
   controllers: [PurchasingController], 
   providers: [ 
     PurchasingService, 
     PerfectReceiptsCalculator, 
     SupplierCertificationCalculator,
     OrderQualityCalculator,
     PurchaseVolumeCalculator,
   ], 
   exports: [PurchasingService], 
 }) 
 export class PurchasingModule {} 
