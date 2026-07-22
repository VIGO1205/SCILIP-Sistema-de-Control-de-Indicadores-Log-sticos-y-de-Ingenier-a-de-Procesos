import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { NotificationsGateway } from './websocket/websocket.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly wsGateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, type: string, title: string, message: string, data?: Record<string, any>) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message, data: data || undefined },
    });

    this.wsGateway.sendToUser(userId, 'notification', {
      id: notification.id,
      type,
      title,
      message,
      data,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new Error('Notificación no encontrada');

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    this.wsGateway.sendToUser(userId, 'notification_read', { id: notificationId });
    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    this.wsGateway.sendToUser(userId, 'notification_all_read', {});
    return { success: true };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new Error('Notificación no encontrada');

    await this.prisma.notification.delete({ where: { id: notificationId } });
    this.wsGateway.sendToUser(userId, 'notification_deleted', { id: notificationId });
    return { success: true };
  }

  async getPrefs(userId: string) {
    let prefs = await this.prisma.userNotificationPref.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await this.prisma.userNotificationPref.create({ data: { userId } });
    }
    return prefs;
  }

  async updatePrefs(userId: string, data: {
    kpiAlerts?: boolean;
    weeklyReports?: boolean;
    purchaseOrders?: boolean;
    inventoryChanges?: boolean;
    emailEnabled?: boolean;
  }) {
    return this.prisma.userNotificationPref.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async notifyApproval(orderId: string, status: 'approved' | 'rejected', reason?: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: {
        creator: true,
        supplier: true,
        lines: { include: { product: true } },
      },
    });

    if (!order?.creator) return;

    const message = status === 'approved'
      ? `Tu orden de compra ${order.poNumber} para ${order.supplier.name} ha sido APROBADA.`
      : `Tu orden de compra ${order.poNumber} para ${order.supplier.name} ha sido RECHAZADA. ${reason ? `Motivo: ${reason}` : ''}`;

    await this.create(
      order.creator.id,
      NotificationType.PURCHASE_ORDER,
      `Orden ${status === 'approved' ? 'Aprobada' : 'Rechazada'}: ${order.poNumber}`,
      message,
      { orderId, status },
    );

    const prefs = await this.getPrefs(order.creator.id);
    if (prefs.emailEnabled && prefs.purchaseOrders) {
      const recipientEmail = order.creator.notificationEmail || order.creator.email;
      // Fire-and-forget: no bloqueamos la respuesta esperando el email
      void this.emailService.sendPurchaseOrderEmail({
        to: recipientEmail,
        recipientName: order.creator.fullName || order.creator.email,
        order: {
          poNumber: order.poNumber,
          status,
          orderDate: order.orderDate,
          expectedDeliveryDate: order.expectedDeliveryDate,
          actualDeliveryDate: order.actualDeliveryDate,
          totalAmount: Number(order.totalAmount),
          notes: order.notes,
          rejectionReason: reason || order.rejectionReason,
        },
        supplier: {
          name: order.supplier.name,
          taxId: (order.supplier as any).taxId,
          email: (order.supplier as any).email,
          phone: (order.supplier as any).phone,
          address: (order.supplier as any).address,
          contactPerson: (order.supplier as any).contactPerson,
        },
        lines: order.lines.map((l) => ({
          product: l.product ? { name: (l.product as any).name, sku: (l.product as any).sku } : null,
          quantityOrdered: l.quantityOrdered,
          quantityReceived: l.quantityReceived,
          quantityRejected: l.quantityRejected,
          unitPrice: Number(l.unitPrice),
          totalPrice: Number(l.totalPrice),
        })),
      });
    }
  }

  async notifyKpiAlert(kpiCode: string, value: number, severity: string, userIds: string[]) {
    const message = `ALERTA KPI: El indicador ${kpiCode} ha alcanzado un valor de ${value} (Severidad: ${severity})`;

    for (const userId of userIds) {
      await this.create(userId, NotificationType.KPI_ALERT, `Alerta KPI: ${kpiCode}`, message, { kpiCode, value, severity });

      const prefs = await this.getPrefs(userId);
      if (prefs.emailEnabled && prefs.kpiAlerts) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          await this.emailService.sendNotification(user.notificationEmail || user.email, `Alerta KPI: ${kpiCode}`, message);
        }
      }
    }
  }
}
