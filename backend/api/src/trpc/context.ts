import { KpiService } from '../modules/kpi/kpi.service';
import { IngestService } from '../modules/ingest/ingest.service';
import { PurchasingService } from '../modules/purchasing/purchasing.service';
import { InventoryProductionService } from '../modules/inventory-production/inventory-production.service';
import { WarehousingService } from '../modules/warehousing/warehousing.service';
import { TransportService } from '../modules/transport/transport.service';
import { CustomerServiceService } from '../modules/customer-service/customer-service.service';
import { InternationalTradeService } from '../modules/international-trade/international-trade.service';
import { CaslAbilityFactory } from '../modules/auth/casl-ability.factory';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../modules/ai/ai.service';
import { ReportsService } from '../modules/reports/reports.service';
import { OtpService } from '../modules/notifications/email/otp.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

export interface Context {
  user?: any;
  kpiService: KpiService;
  ingestService: IngestService;
  purchasingService: PurchasingService;
  inventoryService: InventoryProductionService;
  warehousingService: WarehousingService;
  transportService: TransportService;
  customerService: CustomerServiceService;
  internationalTradeService: InternationalTradeService;
  caslAbilityFactory: CaslAbilityFactory;
  prisma: PrismaService;
  aiService: AiService;
  reportsService: ReportsService;
  otpService: OtpService;
  notificationsService: NotificationsService;
}
