import { Module } from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';
import { CustomerServiceController } from './customer-service.controller';
import { PerfectDeliveriesCalculator } from './calculators/perfect-deliveries.calculator';
import { OnTimeDeliveriesCalculator } from './calculators/on-time-deliveries.calculator';
import { CompleteDeliveriesCalculator } from './calculators/complete-deliveries.calculator';
import { DocumentationAccuracyCalculator } from './calculators/documentation-accuracy.calculator';
import { LogisticsCostVsSalesCalculator } from './calculators/logistics-cost-vs-sales.calculator';
import { LogisticsCostVsProfitCalculator } from './calculators/logistics-cost-vs-profit.calculator';
import { CediCostVsSalesCalculator } from './calculators/cedi-cost-vs-sales.calculator';

@Module({
  controllers: [CustomerServiceController],
  providers: [
    CustomerServiceService,
    PerfectDeliveriesCalculator,
    OnTimeDeliveriesCalculator,
    CompleteDeliveriesCalculator,
    DocumentationAccuracyCalculator,
    LogisticsCostVsSalesCalculator,
    LogisticsCostVsProfitCalculator,
    CediCostVsSalesCalculator,
  ],
  exports: [CustomerServiceService],
})
export class CustomerServiceModule {}
