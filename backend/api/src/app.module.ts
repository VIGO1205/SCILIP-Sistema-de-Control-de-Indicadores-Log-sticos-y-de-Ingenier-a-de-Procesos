import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './prisma/prisma.module';
import { PurchasingModule } from './modules/purchasing/purchasing.module';
import { InventoryProductionModule } from './modules/inventory-production/inventory-production.module';
import { WarehousingModule } from './modules/warehousing/warehousing.module';
import { TransportModule } from './modules/transport/transport.module';
import { CustomerServiceModule } from './modules/customer-service/customer-service.module';
import { InternationalTradeModule } from './modules/international-trade/international-trade.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { ReportsModule } from './modules/reports/reports.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TrpcModule } from './trpc/trpc.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    NotificationsModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    AuthModule,
    PurchasingModule,
    InventoryProductionModule,
    WarehousingModule,
    TransportModule,
    CustomerServiceModule,
    InternationalTradeModule,
    IngestModule,
    ReportsModule,
    KpiModule,
    AiModule,
    TrpcModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
