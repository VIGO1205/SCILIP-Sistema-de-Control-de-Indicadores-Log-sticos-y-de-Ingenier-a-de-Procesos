import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import * as trpcExpress from '@trpc/server/adapters/express';
import { TrpcService } from './trpc.service';
import { appRouter } from './trpc.router';
import { KpiModule } from '../modules/kpi/kpi.module';
import { IngestModule } from '../modules/ingest/ingest.module';
import { PurchasingModule } from '../modules/purchasing/purchasing.module';
import { InventoryProductionModule } from '../modules/inventory-production/inventory-production.module';
import { WarehousingModule } from '../modules/warehousing/warehousing.module';
import { TransportModule } from '../modules/transport/transport.module';
import { CustomerServiceModule } from '../modules/customer-service/customer-service.module';
import { InternationalTradeModule } from '../modules/international-trade/international-trade.module';
import { AuthModule } from '../modules/auth/auth.module';
import { AiModule } from '../modules/ai/ai.module';
import { ReportsModule } from '../modules/reports/reports.module';
import { TrpcAuthMiddleware } from './trpc-auth.middleware';

@Module({
  imports: [
    KpiModule, 
    IngestModule, 
    PurchasingModule, 
    InventoryProductionModule,
    WarehousingModule,
    TransportModule,
    CustomerServiceModule,
    InternationalTradeModule,
    AuthModule,
    AiModule,
    ReportsModule,
  ],
  providers: [TrpcService, TrpcAuthMiddleware],
})
export class TrpcModule implements NestModule {
  constructor(private readonly trpcService: TrpcService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TrpcAuthMiddleware).forRoutes('/trpc');
    consumer
      .apply(
        trpcExpress.createExpressMiddleware({
          router: appRouter,
          createContext: (opts) => this.trpcService.createContext(opts),
        }),
      )
      .forRoutes('/trpc');
  }
}
