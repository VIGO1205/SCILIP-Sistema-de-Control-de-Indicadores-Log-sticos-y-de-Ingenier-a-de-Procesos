import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { WarehousingService } from './warehousing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('warehousing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousingController {
  constructor(private readonly warehousingService: WarehousingService) {}

  @Get('cost-per-square-meter')
  @Roles('admin', 'operations_manager')
  async getCostPerSquareMeter(
    @Query('warehouseId') warehouseId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.warehousingService.calculateCostPerSquareMeter(
      warehouseId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('dispatch-compliance')
  @Roles('admin', 'operations_manager')
  async getDispatchCompliance(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.warehousingService.calculateDispatchCompliance(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('stored-unit-cost')
  @Roles('admin', 'operations_manager')
  async getStoredUnitCost(
    @Query('warehouseId') warehouseId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.warehousingService.calculateStoredUnitCost(
      warehouseId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('units-per-employee')
  @Roles('admin', 'operations_manager')
  async getUnitsPerEmployee(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.warehousingService.calculateUnitsPerEmployee(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('dispatch-cost-per-employee')
  @Roles('admin', 'operations_manager')
  async getDispatchCostPerEmployee(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.warehousingService.calculateDispatchCostPerEmployee(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('dispatched-unit-cost')
  @Roles('admin', 'operations_manager')
  async getDispatchedUnitCost(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.warehousingService.calculateDispatchedUnitCost(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // --- CRUD Warehouses ---
  @Get('warehouses')
  async getWarehouses(@CurrentUser() user: any) {
    return this.warehousingService.getWarehouses(user.companyId);
  }

  @Post('warehouses')
  @Roles('admin', 'operations_manager')
  async createWarehouse(@CurrentUser() user: any, @Body() data: any) {
    return this.warehousingService.createWarehouse(user.companyId, data);
  }

  // --- Operational Costs ---
  @Get('costs')
  @Roles('admin', 'operations_manager')
  async getOperationalCosts(@CurrentUser() user: any, @Query() filters: any) {
    return this.warehousingService.getOperationalCosts(user.companyId, filters);
  }

  @Post('costs')
  @Roles('admin', 'operations_manager')
  async createOperationalCost(@CurrentUser() user: any, @Body() data: any) {
    return this.warehousingService.createOperationalCost(user.companyId, data);
  }
}
