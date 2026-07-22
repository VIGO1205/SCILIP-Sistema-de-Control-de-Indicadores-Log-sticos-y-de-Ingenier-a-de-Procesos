import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum NotificationType {
  KPI_ALERT = 'KPI_ALERT',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  INVENTORY = 'INVENTORY',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: Record<string, any>;
}

export class UpdateNotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  kpiAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;

  @IsOptional()
  @IsBoolean()
  purchaseOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  inventoryChanges?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;
}
