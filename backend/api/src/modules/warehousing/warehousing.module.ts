import { Module } from '@nestjs/common';
import { WarehousingService } from './warehousing.service';
import { WarehousingController } from './warehousing.controller';
import { CostPerSquareMeterCalculator } from './calculators/cost-per-square-meter.calculator';
import { DispatchComplianceCalculator } from './calculators/dispatch-compliance.calculator';
import { DispatchCostPerEmployeeCalculator } from './calculators/dispatch-cost-per-employee.calculator';
import { DispatchedUnitCostCalculator } from './calculators/dispatched-unit-cost.calculator';
import { StoredUnitCostCalculator } from './calculators/stored-unit-cost.calculator';
import { UnitsPerEmployeeCalculator } from './calculators/units-per-employee.calculator';

@Module({
  controllers: [WarehousingController],
  providers: [
    WarehousingService,
    CostPerSquareMeterCalculator,
    DispatchComplianceCalculator,
    DispatchCostPerEmployeeCalculator,
    DispatchedUnitCostCalculator,
    StoredUnitCostCalculator,
    UnitsPerEmployeeCalculator,
  ],
  exports: [WarehousingService],
})
export class WarehousingModule {}
