import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('purchasing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasingController {
  constructor(private readonly purchasingService: PurchasingService) {}

  @Get('pending-approvals')
  @Roles('admin', 'purchasing_manager')
  async getPendingApprovals() {
    return this.purchasingService.getPendingApprovals();
  }

  @Post(':id/approve')
  @Roles('admin', 'purchasing_manager')
  async approveOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchasingService.approveOrder(id, user.id);
  }

  @Post(':id/reject')
  @Roles('admin', 'purchasing_manager')
  async rejectOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.purchasingService.rejectOrder(id, user.id, reason);
  }

  @Get('supplier-certification')
  @Roles('admin', 'purchasing_manager')
  async getSupplierCertification(@Query('companyId') companyId: string) {
    return this.purchasingService.calculateSupplierCertification(companyId);
  }

  @Get('order-quality')
  @Roles('admin', 'purchasing_manager')
  async getOrderQuality(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.purchasingService.calculateOrderQuality(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('purchase-volume')
  @Roles('admin', 'purchasing_manager')
  async getPurchaseVolume(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.purchasingService.calculatePurchaseVolume(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // --- Suppliers CRUD ---
  @Get('suppliers')
  async getSuppliers(@CurrentUser() user: any) {
    return this.purchasingService.getSuppliers(user.companyId);
  }

  @Post('suppliers')
  @Roles('admin', 'purchasing_manager')
  async createSupplier(@CurrentUser() user: any, @Body() data: any) {
    return this.purchasingService.createSupplier(user.companyId, data);
  }

  @Post('suppliers/:id')
  @Roles('admin', 'purchasing_manager')
  async updateSupplier(@Param('id') id: string, @Body() data: any) {
    return this.purchasingService.updateSupplier(id, data);
  }

  // --- Purchase Orders CRUD ---
  @Get('orders')
  async getPurchaseOrders(@CurrentUser() user: any, @Query() filters: any) {
    return this.purchasingService.getPurchaseOrders(user.companyId, filters);
  }

  @Post('orders')
  async createPurchaseOrder(@CurrentUser() user: any, @Body() data: any) {
    return this.purchasingService.createPurchaseOrder(user.companyId, user.id, data);
  }
}
