import { Module } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { KpiAlertService } from './kpi-alert.service';
import { PurchasingModule } from '../purchasing/purchasing.module';
import { TransportModule } from '../transport/transport.module';
import { InventoryProductionModule } from '../inventory-production/inventory-production.module';
import { WarehousingModule } from '../warehousing/warehousing.module';
import { CustomerServiceModule } from '../customer-service/customer-service.module';
import { InternationalTradeModule } from '../international-trade/international-trade.module';

@Module({
  imports: [
    PurchasingModule,
    TransportModule,
    InventoryProductionModule,
    WarehousingModule,
    CustomerServiceModule,
    InternationalTradeModule,
  ],
  providers: [KpiService, KpiAlertService],
  exports: [KpiService, KpiAlertService],
})
export class KpiModule {}
