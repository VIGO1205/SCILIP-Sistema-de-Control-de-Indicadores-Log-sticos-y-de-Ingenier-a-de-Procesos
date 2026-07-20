import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('transport')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('vs-sales')
  @Roles('admin', 'transport_manager')
  async getTransportVsSales(
    @Query('companyId') companyId: string,
    @Query('year') year: string,
  ) {
    return this.transportService.getTransportVsSalesSummary(companyId, parseInt(year, 10));
  }

  @Get('cost-per-driver')
  @Roles('admin', 'transport_manager')
  async getCostPerDriver(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transportService.calculateCostPerDriver(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('comparative')
  @Roles('admin', 'transport_manager')
  async getTransportComparative(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transportService.calculateTransportComparative(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // --- CRUD Vehicles ---
  @Get('vehicles')
  async getVehicles(@CurrentUser() user: any) {
    return this.transportService.getVehicles(user.companyId);
  }

  // --- CRUD Transport Costs ---
  @Get('costs')
  @Roles('admin', 'transport_manager')
  async getTransportCosts(@CurrentUser() user: any, @Query() filters: any) {
    return this.transportService.getTransportCosts(user.companyId, filters);
  }

  @Post('costs')
  @Roles('admin', 'transport_manager')
  async createTransportCost(@CurrentUser() user: any, @Body() data: any) {
    return this.transportService.createTransportCost(user.companyId, data);
  }
}
