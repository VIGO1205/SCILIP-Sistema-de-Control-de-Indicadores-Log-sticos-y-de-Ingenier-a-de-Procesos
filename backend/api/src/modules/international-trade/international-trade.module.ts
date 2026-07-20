import { Module } from '@nestjs/common';
import { InternationalTradeService } from './international-trade.service';
import { InternationalTradeController } from './international-trade.controller';
import { InternationalTradeUnitCostCalculator } from './calculators/international-trade-unit-cost.calculator';

@Module({
  controllers: [InternationalTradeController],
  providers: [
    InternationalTradeService,
    InternationalTradeUnitCostCalculator,
  ],
  exports: [InternationalTradeService],
})
export class InternationalTradeModule {}
