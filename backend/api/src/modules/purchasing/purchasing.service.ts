import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PerfectReceiptsCalculator } from './calculators/perfect-receipts.calculator';
import { SupplierCertificationCalculator } from './calculators/supplier-certification.calculator';
import { OrderQualityCalculator } from './calculators/order-quality.calculator';
import { PurchaseVolumeCalculator } from './calculators/purchase-volume.calculator';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchasingService {
  private readonly logger = new Logger(PurchasingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfectReceiptsCalculator: PerfectReceiptsCalculator,
    private readonly supplierCertificationCalculator: SupplierCertificationCalculator,
    private readonly orderQualityCalculator: OrderQualityCalculator,
    private readonly purchaseVolumeCalculator: PurchaseVolumeCalculator,
    private readonly notificationsService: NotificationsService,
  ) {}

  // --- KPIs ---
  async calculateSupplierCertification(companyId: string) {
    return this.supplierCertificationCalculator.calculate(companyId);
  }

  async calculateOrderQuality(companyId: string, startDate: Date, endDate: Date) {
    return this.orderQualityCalculator.calculate(companyId, startDate, endDate);
  }

  async calculatePurchaseVolume(companyId: string, startDate: Date, endDate: Date) {
    return this.purchaseVolumeCalculator.calculate(companyId, startDate, endDate);
  }

  // --- Suppliers CRUD ---
  async getSuppliers(companyId: string) {
    return this.prisma.supplier.findMany({
      where: { companyId, status: 'active' },
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(companyId: string, data: any) {
    return this.prisma.supplier.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async updateSupplier(id: string, companyId: string, data: any) {
    return this.prisma.supplier.update({
      where: { id, companyId },
      data,
    });
  }

  // --- Supplier Rating (Hybrid: Auto + Manual) ---
  async calculateSupplierRating(supplierId: string, companyId: string) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const orders = await this.prisma.purchaseOrder.findMany({
      where: {
        supplierId,
        companyId,
        status: { in: ['received', 'completed', 'approved'] },
        orderDate: { gte: oneYearAgo },
      },
      include: { lines: true },
      orderBy: { orderDate: 'desc' },
    });

    if (orders.length === 0) {
      return {
        autoRating: 0,
        onTimeScore: 0,
        qualityScore: 0,
        quantityScore: 0,
        totalOrders: 0,
      };
    }

    // 1. Entregas a tiempo (30%)
    const onTimeOrders = orders.filter((o) => {
      if (!o.actualDeliveryDate || !o.expectedDeliveryDate) return false;
      return new Date(o.actualDeliveryDate) <= new Date(o.expectedDeliveryDate);
    }).length;
    const onTimeScore = (onTimeOrders / orders.length) * 100;

    // 2. Calidad - rechazos (30%)
    let totalOrdered = 0;
    let totalRejected = 0;
    orders.forEach((o) => {
      o.lines.forEach((l) => {
        totalOrdered += l.quantityOrdered;
        totalRejected += l.quantityRejected;
      });
    });
    const qualityScore = totalOrdered > 0 ? ((totalOrdered - totalRejected) / totalOrdered) * 100 : 0;

    // 3. Cumplimiento de cantidad (20%)
    let totalReceived = 0;
    orders.forEach((o) => {
      o.lines.forEach((l) => {
        totalReceived += l.quantityReceived;
      });
    });
    const quantityScore = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

    // 4. Estatus de órdenes (20%) - cuántas fueron exitosas
    const successfulOrders = orders.filter((o) => o.status === 'received' || o.status === 'completed').length;
    const successScore = (successfulOrders / orders.length) * 100;

    // Fórmula ponderada: escala 0-5
    const weightedScore =
      (onTimeScore * 0.30) +
      (qualityScore * 0.30) +
      (quantityScore * 0.20) +
      (successScore * 0.20);

    const autoRating = (weightedScore / 100) * 5;

    return {
      autoRating: Math.round(autoRating * 100) / 100,
      onTimeScore: Math.round(onTimeScore * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10,
      quantityScore: Math.round(quantityScore * 10) / 10,
      successScore: Math.round(successScore * 10) / 10,
      totalOrders: orders.length,
    };
  }

  async getSupplierRating(supplierId: string, companyId: string) {
    const auto = await this.calculateSupplierRating(supplierId, companyId);
    const history = await this.prisma.supplierRatingHistory.findFirst({
      where: { supplierId, companyId },
      orderBy: { createdAt: 'desc' },
    });

    const manualRating = history?.manualRating ? Number(history.manualRating) : null;
    const finalRating = manualRating ?? auto.autoRating;

    return {
      autoRating: auto.autoRating,
      manualRating,
      finalRating: Math.round(finalRating * 100) / 100,
      breakdown: {
        onTimeScore: auto.onTimeScore,
        qualityScore: auto.qualityScore,
        quantityScore: auto.quantityScore,
        successScore: auto.successScore,
      },
      totalOrders: auto.totalOrders,
      lastEvaluation: history?.createdAt ?? null,
      comment: history?.comment ?? null,
    };
  }

  async evaluateSupplier(
    supplierId: string,
    companyId: string,
    userId: string,
    data: { manualRating: number; comment?: string },
  ) {
    const auto = await this.calculateSupplierRating(supplierId, companyId);

    const record = await this.prisma.supplierRatingHistory.create({
      data: {
        supplierId,
        companyId,
        autoRating: auto.autoRating,
        manualRating: data.manualRating,
        finalRating: data.manualRating,
        comment: data.comment || null,
        createdBy: userId,
      },
    });

    await this.prisma.supplier.update({
      where: { id: supplierId },
      data: { rating: data.manualRating },
    });

    return record;
  }

  // --- Purchase Orders CRUD ---
  async getPurchaseOrders(companyId: string, filters?: any) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        companyId,
        ...(filters?.supplierId ? { supplierId: filters.supplierId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: {
        supplier: true,
        creator: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPurchaseOrder(companyId: string, userId: string, data: any) {
    const { lines, warehouseId, ...orderData } = data;

    return this.prisma.purchaseOrder.create({
      data: {
        ...orderData,
        companyId,
        createdBy: userId,
        warehouseId: warehouseId || null,
        status: 'pending',
        lines: {
          create: lines.map((line: any) => ({
            productId: line.productId,
            quantityOrdered: line.quantity,
            unitPrice: line.unitPrice,
            totalPrice: line.quantity * line.unitPrice,
          })),
        },
      },
      include: {
        lines: true,
      },
    });
  }

  async getPendingApprovals(companyId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { status: 'pending', companyId },
      include: {
        supplier: true,
        creator: { select: { id: true, fullName: true, email: true } },
        lines: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveOrder(orderId: string, userId: string, companyId: string) {
    this.logger.log(`Approving order ${orderId} by user ${userId}`);
    const order = await this.prisma.purchaseOrder.update({
      where: { id: orderId, companyId },
      data: {
        status: 'approved',
        approvedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.notificationsService.notifyApproval(orderId, 'approved');

    return order;
  }

  async rejectOrder(orderId: string, userId: string, reason: string, companyId: string) {
    this.logger.log(`Rejecting order ${orderId} by user ${userId}. Reason: ${reason}`);
    const order = await this.prisma.purchaseOrder.update({
      where: { id: orderId, companyId },
      data: {
        status: 'rejected',
        approvedBy: userId,
        rejectionReason: reason,
        updatedAt: new Date(),
      },
    });

    await this.notificationsService.notifyApproval(orderId, 'rejected', reason);

    return order;
  }

  async receiveOrder(
    orderId: string,
    userId: string,
    companyId: string,
    data: { actualDeliveryDate?: Date; notes?: string },
  ) {
    this.logger.log(`Marking order ${orderId} as received by user ${userId}`);
    const order = await this.prisma.purchaseOrder.update({
      where: { id: orderId, companyId },
      data: {
        status: 'received',
        actualDeliveryDate: data.actualDeliveryDate || new Date(),
        notes: data.notes || undefined,
        updatedAt: new Date(),
      },
      include: { creator: true, supplier: true, lines: { include: { product: true } } },
    });

    if (order.creator) {
      const message = `La orden de compra ${order.poNumber} del proveedor ${(order.supplier as any)?.name} ha sido marcada como RECIBIDA.`;
      await this.notificationsService.create(
        order.creator.id,
        'PURCHASE_ORDER',
        `Orden Recibida: ${order.poNumber}`,
        message,
        { orderId, status: 'received' },
      );
      const prefs = await this.notificationsService.getPrefs(order.creator.id);
      if (prefs.emailEnabled && prefs.purchaseOrders) {
        const notifEmail = (order.creator as any).notificationEmail || order.creator.email;
        // Fire-and-forget: el estado ya está guardado, el email va en segundo plano
        void this.notificationsService['emailService'].sendPurchaseOrderEmail({
          to: notifEmail,
          recipientName: (order.creator as any).fullName || order.creator.email,
          order: {
            poNumber: order.poNumber,
            status: 'received',
            orderDate: order.orderDate,
            expectedDeliveryDate: order.expectedDeliveryDate,
            actualDeliveryDate: order.actualDeliveryDate,
            totalAmount: Number(order.totalAmount),
            notes: order.notes,
          },
          supplier: {
            name: (order.supplier as any).name,
            taxId: (order.supplier as any).taxId,
            email: (order.supplier as any).email,
            phone: (order.supplier as any).phone,
            address: (order.supplier as any).address,
            contactPerson: (order.supplier as any).contactPerson,
          },
          lines: (order.lines as any[]).map((l) => ({
            product: l.product ? { name: l.product.name, sku: l.product.sku } : null,
            quantityOrdered: l.quantityOrdered,
            quantityReceived: l.quantityReceived,
            quantityRejected: l.quantityRejected,
            unitPrice: Number(l.unitPrice),
            totalPrice: Number(l.totalPrice),
          })),
        });
      }
    }

    return order;
  }

  async completeOrder(orderId: string, userId: string, companyId: string) {
    this.logger.log(`Completing order ${orderId} by user ${userId}`);
    const order = await this.prisma.purchaseOrder.update({
      where: { id: orderId, companyId },
      data: {
        status: 'completed',
        updatedAt: new Date(),
      },
      include: { creator: true, supplier: true, lines: { include: { product: true } } },
    });

    if (order.creator) {
      const message = `La orden de compra ${order.poNumber} del proveedor ${(order.supplier as any)?.name} ha sido COMPLETADA y cerrada exitosamente.`;
      await this.notificationsService.create(
        order.creator.id,
        'PURCHASE_ORDER',
        `Orden Completada: ${order.poNumber}`,
        message,
        { orderId, status: 'completed' },
      );
      const prefs = await this.notificationsService.getPrefs(order.creator.id);
      if (prefs.emailEnabled && prefs.purchaseOrders) {
        const notifEmail = (order.creator as any).notificationEmail || order.creator.email;
        // Fire-and-forget: el estado ya está guardado, el email va en segundo plano
        void this.notificationsService['emailService'].sendPurchaseOrderEmail({
          to: notifEmail,
          recipientName: (order.creator as any).fullName || order.creator.email,
          order: {
            poNumber: order.poNumber,
            status: 'completed',
            orderDate: order.orderDate,
            expectedDeliveryDate: order.expectedDeliveryDate,
            actualDeliveryDate: order.actualDeliveryDate,
            totalAmount: Number(order.totalAmount),
            notes: order.notes,
          },
          supplier: {
            name: (order.supplier as any).name,
            taxId: (order.supplier as any).taxId,
            email: (order.supplier as any).email,
            phone: (order.supplier as any).phone,
            address: (order.supplier as any).address,
            contactPerson: (order.supplier as any).contactPerson,
          },
          lines: (order.lines as any[]).map((l) => ({
            product: l.product ? { name: l.product.name, sku: l.product.sku } : null,
            quantityOrdered: l.quantityOrdered,
            quantityReceived: l.quantityReceived,
            quantityRejected: l.quantityRejected,
            unitPrice: Number(l.unitPrice),
            totalPrice: Number(l.totalPrice),
          })),
        });
      }
    }

    return order;
  }

  async calculatePerfectReceipts(input: {
    companyId: string;
    startDate: Date;
    endDate: Date;
    supplierId?: string;
  }) {
    return this.perfectReceiptsCalculator.calculate(
      input.companyId,
      input.startDate,
      input.endDate,
      input.supplierId,
    );
  }

  async getPerfectReceiptsTimeSeries(input: {
    companyId: string;
    startDate: Date;
    endDate: Date;
    supplierId?: string;
  }) {
    return this.perfectReceiptsCalculator.getTimeSeries(
      input.companyId,
      input.startDate,
      input.endDate,
      input.supplierId,
    );
  }
}
