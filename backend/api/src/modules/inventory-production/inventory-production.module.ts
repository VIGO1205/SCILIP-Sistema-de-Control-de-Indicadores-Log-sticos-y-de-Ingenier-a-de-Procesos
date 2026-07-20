import { Module } from '@nestjs/common';
import { InventoryProductionService } from './inventory-production.service';
import { InventoryProductionController } from './inventory-production.controller';
import { InventoryAccuracyCalculator } from './calculators/inventory-accuracy.calculator';
import { CapacityUtilizationCalculator } from './calculators/capacity-utilization.calculator';
import { EconomicInventoryValueCalculator } from './calculators/economic-inventory-value.calculator';
import { InventoryAgingCalculator } from './calculators/inventory-aging.calculator';
import { InventoryDurationCalculator } from './calculators/inventory-duration.calculator';
import { MachinePerformanceCalculator } from './calculators/machine-performance.calculator';
import { MerchandiseRotationCalculator } from './calculators/merchandise-rotation.calculator';

@Module({
  controllers: [InventoryProductionController],
  providers: [
    InventoryProductionService,
    InventoryAccuracyCalculator,
    CapacityUtilizationCalculator,
    EconomicInventoryValueCalculator,
    InventoryAgingCalculator,
    InventoryDurationCalculator,
    MachinePerformanceCalculator,
    MerchandiseRotationCalculator,
  ],
  exports: [InventoryProductionService],
})
export class InventoryProductionModule {}
