import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email/email.service';
import { NotificationsGateway } from './websocket/websocket.gateway';

@Global()
@Module({
  providers: [NotificationsService, EmailService, NotificationsGateway],
  exports: [NotificationsService, EmailService, NotificationsGateway],
})
export class NotificationsModule {}
