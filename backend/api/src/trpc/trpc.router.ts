import { router } from './trpc';
import { kpiRouter } from './routers/kpi.router';
import { purchasingRouter } from './routers/purchasing.router';
import { inventoryRouter } from './routers/inventory.router';
import { warehousingRouter } from './routers/warehousing.router';
import { transportRouter } from './routers/transport.router';
import { customerServiceRouter } from './routers/customer-service.router';
import { internationalTradeRouter } from './routers/international-trade.router';
import { logsRouter } from './routers/logs.router';
import { aiRouter } from './routers/ai.router';
import { reportRouter } from './routers/report.router';
import { userRouter } from './routers/user.router';
import { notificationRouter } from './routers/notification.router';
import { companyRouter } from './routers/company.router';

export const appRouter = router({
  kpi: kpiRouter,
  purchasing: purchasingRouter,
  inventory: inventoryRouter,
  warehousing: warehousingRouter,
  transport: transportRouter,
  customerService: customerServiceRouter,
  internationalTrade: internationalTradeRouter,
  logs: logsRouter,
  ai: aiRouter,
  report: reportRouter,
  user: userRouter,
  notification: notificationRouter,
  company: companyRouter,
});

export type AppRouter = typeof appRouter;
