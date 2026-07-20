import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InternationalTradeService } from './international-trade.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('international-trade')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternationalTradeController {
  constructor(private readonly internationalTradeService: InternationalTradeService) {}

  @Get('unit-cost')
  @Roles('admin', 'international_trade_manager')
  async getUnitCost(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: 'IMPORT' | 'EXPORT',
  ) {
    return this.internationalTradeService.calculateUnitCost(
      companyId,
      new Date(startDate),
      new Date(endDate),
      type,
    );
  }

  // --- CRUD Operations ---
  @Get('operations')
  async getOperations(@CurrentUser() user: any, @Query() filters: any) {
    return this.internationalTradeService.getOperations(user.companyId, filters);
  }

  @Post('operations')
  @Roles('admin', 'international_trade_manager')
  async createOperation(@CurrentUser() user: any, @Body() data: any) {
    return this.internationalTradeService.createOperation(user.companyId, data);
  }
}
