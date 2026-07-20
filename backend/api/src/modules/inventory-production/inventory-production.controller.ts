import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryProductionService } from './inventory-production.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inventory-production')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryProductionController {
  constructor(private readonly inventoryProductionService: InventoryProductionService) {}

  @Get('inventory-accuracy')
  @Roles('admin', 'operations_manager')
  async getInventoryAccuracy(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryProductionService.calculateInventoryAccuracy(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('capacity-utilization')
  @Roles('admin', 'operations_manager')
  async getCapacityUtilization(
    @Query('machineId') machineId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryProductionService.calculateCapacityUtilization(
      machineId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('machine-performance')
  @Roles('admin', 'operations_manager')
  async getMachinePerformance(
    @Query('machineId') machineId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryProductionService.calculateMachinePerformance(
      machineId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('merchandise-rotation')
  @Roles('admin', 'operations_manager')
  async getMerchandiseRotation(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryProductionService.calculateMerchandiseRotation(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('inventory-duration')
  @Roles('admin', 'operations_manager')
  async getInventoryDuration(
    @Query('companyId') companyId: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryProductionService.calculateInventoryDuration(
      companyId,
      new Date(endDate),
    );
  }

  @Get('inventory-aging')
  @Roles('admin', 'operations_manager')
  async getInventoryAging(@Query('companyId') companyId: string) {
    return this.inventoryProductionService.calculateInventoryAging(companyId);
  }

  // --- CRUD Products ---
  @Get('products')
  async getProducts(@CurrentUser() user: any) {
    return this.inventoryProductionService.getProducts(user.companyId);
  }

  // --- CRUD Movements ---
  @Get('movements')
  async getMovements(@CurrentUser() user: any, @Query() filters: any) {
    return this.inventoryProductionService.getMovements(user.companyId, filters);
  }

  @Post('movements')
  async createMovement(@CurrentUser() user: any, @Body() data: any) {
    return this.inventoryProductionService.createMovement(user.companyId, data);
  }

  // --- Physical Inventory (Audit) ---
  @Post('physical-inventory')
  @Roles('admin', 'operations_manager')
  async createPhysicalInventory(@CurrentUser() user: any, @Body() data: any) {
    return this.inventoryProductionService.createPhysicalInventory(user.companyId, data);
  }
}
