import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KpiValue, KpiAlert } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class KpiAlertService {
  private readonly logger = new Logger(KpiAlertService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Verifica si un valor de KPI recién calculado dispara alguna alerta configurada
   */
  async checkAlerts(kpiValue: KpiValue) {
    this.logger.log(`Checking alerts for KPI ${kpiValue.kpiId} with value ${kpiValue.actualValue}`);

    // Buscar alertas activas para este KPI
    const activeAlerts = await this.prisma.kpiAlert.findMany({
      where: {
        kpiId: kpiValue.kpiId,
        isActive: true,
      },
      include: {
        definition: true,
      },
    });

    for (const alert of activeAlerts) {
      if (this.shouldTrigger(alert, Number(kpiValue.actualValue))) {
        await this.triggerAlert(alert, kpiValue);
      }
    }
  }

  private shouldTrigger(alert: any, value: number): boolean {
    const threshold = Number(alert.thresholdValue);
    
    switch (alert.comparisonOperator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  private async triggerAlert(alert: any, kpiValue: KpiValue) {
    this.logger.warn(`Alert triggered! KPI: ${alert.definition.code}, Severity: ${alert.severity}`);

    // Registrar en el historial de alertas
    await this.prisma.kpiAlertHistory.create({
      data: {
        kpiValueId: kpiValue.id,
        kpiAlertId: alert.id,
        triggeredValue: kpiValue.actualValue,
      },
    });

    // Actualizar el estado del valor del KPI
    await this.prisma.kpiValue.update({
      where: { id: kpiValue.id },
      data: { status: alert.severity || 'warning' },
    });

    // Notificar a los usuarios interesados (ej. administradores o gerentes de área)
    const usersToNotify = await this.prisma.user.findMany({
      where: {
        role: { name: { in: ['ADMIN', 'SUPER_ADMIN', 'OPERATIONS_MANAGER'] } },
      },
      select: { id: true },
    });

    const userIds = usersToNotify.map(u => u.id);
    
    await this.notificationsService.notifyKpiAlert(
      alert.definition.code,
      Number(kpiValue.actualValue),
      alert.severity,
      userIds
    );
  }
}
