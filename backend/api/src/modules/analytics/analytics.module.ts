import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { WarehouseUtilizationCalculator } from './calculators/utilization/warehouse-utilization.calculator';
import { TransportUtilizationCalculator } from './calculators/utilization/transport-utilization.calculator';
import { InventoryUtilizationCalculator } from './calculators/utilization/inventory-utilization.calculator';
import { AdminProductivityCalculator } from './calculators/productivity/admin-productivity.calculator';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    WarehouseUtilizationCalculator,
    TransportUtilizationCalculator,
    InventoryUtilizationCalculator,
    AdminProductivityCalculator,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}