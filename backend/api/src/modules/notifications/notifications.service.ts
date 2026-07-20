import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { NotificationsGateway } from './websocket/websocket.gateway';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly wsGateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  async notifyApproval(orderId: string, status: 'approved' | 'rejected', reason?: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { 
        creator: true,
        supplier: true 
      },
    });

    if (!order || !order.creator) return;

    const message = status === 'approved' 
      ? `Tu orden de compra ${order.poNumber} para ${order.supplier.name} ha sido APROBADA.`
      : `Tu orden de compra ${order.poNumber} para ${order.supplier.name} ha sido RECHAZADA. Motivo: ${reason}`;

    // 1. Notificación en Tiempo Real (WebSocket)
    this.wsGateway.sendToUser(order.creator.id, 'notification', {
      type: 'PURCHASE_ORDER_STATUS',
      orderId,
      status,
      message,
    });

    // 2. Notificación por Email
    await this.emailService.sendReport({
      to: [order.creator.email],
      subject: `Actualización de Orden de Compra: ${order.poNumber}`,
      body: message,
      attachments: [],
    });

    this.logger.log(`Notification sent to ${order.creator.email} for order ${order.poNumber}`);
  }

  async notifyKpiAlert(kpiCode: string, value: number, severity: string, userIds: string[]) {
    const message = `ALERTA KPI: El indicador ${kpiCode} ha alcanzado un valor de ${value} (Severidad: ${severity})`;

    for (const userId of userIds) {
      this.wsGateway.sendToUser(userId, 'kpi_alert', {
        kpiCode,
        value,
        severity,
        message,
      });
    }
    
    this.logger.log(`KPI Alert notification sent for ${kpiCode}`);
  }
}
