import { Injectable } from '@nestjs/common';
import { KpiService } from '../modules/kpi/kpi.service';
import { IngestService } from '../modules/ingest/ingest.service';
import { PurchasingService } from '../modules/purchasing/purchasing.service';
import { InventoryProductionService } from '../modules/inventory-production/inventory-production.service';
import { WarehousingService } from '../modules/warehousing/warehousing.service';
import { TransportService } from '../modules/transport/transport.service';
import { CustomerServiceService } from '../modules/customer-service/customer-service.service';
import { InternationalTradeService } from '../modules/international-trade/international-trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaslAbilityFactory } from '../modules/auth/casl-ability.factory';
import { AiService } from '../modules/ai/ai.service';
import { ReportsService } from '../modules/reports/reports.service';
import { OtpService } from '../modules/notifications/email/otp.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { Context } from './context';

@Injectable()
export class TrpcService {
  constructor(
    private kpiService: KpiService,
    private ingestService: IngestService,
    private purchasingService: PurchasingService,
    private inventoryService: InventoryProductionService,
    private warehousingService: WarehousingService,
    private transportService: TransportService,
    private customerService: CustomerServiceService,
    private internationalTradeService: InternationalTradeService,
    private prisma: PrismaService,
    private caslAbilityFactory: CaslAbilityFactory,
    private aiService: AiService,
    private reportsService: ReportsService,
    private otpService: OtpService,
    private notificationsService: NotificationsService,
  ) {}

  createContext(opts: any): Context {
    const user = opts.req?.user;
    if (user?.role?.permissions) {
      const permissions = user.role.permissions as { companyId?: string };
      if (!user.companyId && permissions.companyId) {
        user.companyId = permissions.companyId;
      }
    }
    return {
      user,
      kpiService: this.kpiService,
      ingestService: this.ingestService,
      purchasingService: this.purchasingService,
      inventoryService: this.inventoryService,
      warehousingService: this.warehousingService,
      transportService: this.transportService,
      customerService: this.customerService,
      internationalTradeService: this.internationalTradeService,
      prisma: this.prisma,
      caslAbilityFactory: this.caslAbilityFactory,
      aiService: this.aiService,
      reportsService: this.reportsService,
      otpService: this.otpService,
      notificationsService: this.notificationsService,
    };
  }
}
