import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './email/email.service';
import { OtpService } from './email/otp.service';
import { NotificationsGateway } from './websocket/websocket.gateway';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, OtpService, NotificationsGateway],
  exports: [NotificationsService, EmailService, OtpService, NotificationsGateway],
})
export class NotificationsModule {}
