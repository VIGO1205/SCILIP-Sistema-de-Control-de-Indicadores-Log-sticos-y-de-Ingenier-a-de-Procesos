import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { TransportVsSalesCalculator } from './calculators/transport-vs-sales.calculator';
import { CostPerDriverCalculator } from './calculators/cost-per-driver.calculator';
import { TransportComparativeCalculator } from './calculators/transport-comparative.calculator';

@Module({
  controllers: [TransportController],
  providers: [
    TransportService,
    TransportVsSalesCalculator,
    CostPerDriverCalculator,
    TransportComparativeCalculator,
  ],
  exports: [TransportService],
})
export class TransportModule {}
