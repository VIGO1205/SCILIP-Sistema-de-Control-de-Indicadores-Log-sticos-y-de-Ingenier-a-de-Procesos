import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('customer-service')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerServiceController {
  constructor(private readonly customerService: CustomerServiceService) {}

  @Get('perfect-deliveries')
  @Roles('admin', 'customer_service_manager')
  async getPerfectDeliveries(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculatePerfectDeliveries(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('on-time-deliveries')
  @Roles('admin', 'customer_service_manager')
  async getOnTimeDeliveries(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculateOnTimeDeliveries(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('complete-deliveries')
  @Roles('admin', 'customer_service_manager')
  async getCompleteDeliveries(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculateCompleteDeliveries(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('documentation-accuracy')
  @Roles('admin', 'customer_service_manager')
  async getDocumentationAccuracy(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculateDocumentationAccuracy(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('logistics-cost-vs-sales')
  @Roles('admin', 'customer_service_manager')
  async getLogisticsCostVsSales(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculateLogisticsCostVsSales(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('logistics-cost-vs-profit')
  @Roles('admin', 'customer_service_manager')
  async getLogisticsCostVsProfit(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculateLogisticsCostVsProfit(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('cedi-cost-vs-sales')
  @Roles('admin', 'customer_service_manager')
  async getCediCostVsSales(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.customerService.calculateCediCostVsSales(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // --- CRUD Dispatches ---
  @Get('dispatches')
  async getDispatches(@CurrentUser() user: any, @Query() filters: any) {
    return this.customerService.getDispatches(user.companyId, filters);
  }

  @Post('dispatches')
  @Roles('admin', 'customer_service_manager')
  async createDispatch(@CurrentUser() user: any, @Body() data: any) {
    return this.customerService.createDispatch(user.companyId, data);
  }

  @Post('dispatches/:id/status')
  @Roles('admin', 'customer_service_manager')
  async updateDispatchStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('details') details: any,
  ) {
    return this.customerService.updateDispatchStatus(id, status, details);
  }
}
