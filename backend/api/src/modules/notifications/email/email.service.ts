import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';

// Render tiene problemas con IPv6 saliente en su capa gratuita/starter,
// lo que causa el error ENETUNREACH con Gmail. Esto fuerza a Node a usar IPv4.
dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async send(to: string[], subject: string, html: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('SMTP no configurado — email no enviado');
      this.logger.log(`[SIMULADO] Email a ${to.join(', ')}: ${subject}`);
      return { success: true, simulated: true };
    }

    // Timeout de 30 segundos para el envío
    const sendWithTimeout = Promise.race([
      this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"SCILIP" <${process.env.SMTP_USER}>`,
        to: to.join(', '),
        subject,
        html,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout (30s)')), 30000),
      ),
    ]);

    try {
      const info = await sendWithTimeout as any;
      this.logger.log(`Email enviado: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Error enviando email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lanza el envío en segundo plano (fire-and-forget).
   * La BD ya fue actualizada antes de llamar a este método.
   */
  sendInBackground(to: string[], subject: string, html: string): void {
    this.send(to, subject, html).catch(() => {/* ya logueado en send() */});
  }

  async sendOtpCode(email: string, code: string, userName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
            <h1 style="color:#fff;font-size:20px;margin:0;">SCILIP</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:6px 0 0;">Sistema de Control de Indicadores Logísticos</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1f2937;font-size:16px;margin:0 0 8px;">Tu código de verificación</h2>
            <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Hola ${userName}, usá el siguiente código para completar la verificación:</p>
            <div style="background:#f9fafb;border:2px dashed #d1d5db;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
              <span style="font-size:36px;font-weight:bold;color:#4f46e5;letter-spacing:8px;">${code}</span>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">Este código expira en <strong>10 minutos</strong>.</p>
            <p style="color:#9ca3af;font-size:12px;margin:0;">Si no solicitaste este código, ignorá este mensaje.</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">SCILIP &copy; ${new Date().getFullYear()} — Sistema de Control de Indicadores Logísticos</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.send([email], `Código de verificación SCILIP: ${code}`, html);
  }

  async sendNotification(email: string, title: string, message: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px;text-align:center;">
            <h1 style="color:#fff;font-size:18px;margin:0;">SCILIP</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1f2937;font-size:16px;margin:0 0 12px;">${title}</h2>
            <p style="color:#4b5563;font-size:13px;line-height:1.6;margin:0;">${message}</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">SCILIP &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.send([email], title, html);
  }

  async sendPurchaseOrderEmail(options: {
    to: string;
    recipientName: string;
    order: {
      poNumber: string;
      status: 'approved' | 'rejected' | 'received' | 'completed';
      orderDate: Date | string;
      expectedDeliveryDate?: Date | string | null;
      actualDeliveryDate?: Date | string | null;
      totalAmount: number;
      notes?: string | null;
      rejectionReason?: string | null;
    };
    supplier: {
      name: string;
      taxId?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      contactPerson?: string | null;
    };
    lines: Array<{
      product: { name: string; sku?: string | null } | null;
      quantityOrdered: number;
      quantityReceived?: number;
      quantityRejected?: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }) {
    const { to, recipientName, order, supplier, lines } = options;

    const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; description: string }> = {
      approved: {
        label: 'APROBADA',
        color: '#065f46',
        bg: '#d1fae5',
        icon: '✅',
        description: 'La orden de compra ha sido aprobada y se encuentra en proceso de gestión con el proveedor.',
      },
      rejected: {
        label: 'RECHAZADA',
        color: '#991b1b',
        bg: '#fee2e2',
        icon: '❌',
        description: 'La orden de compra ha sido rechazada. Por favor revisa el motivo indicado a continuación.',
      },
      received: {
        label: 'MERCANCÍA RECIBIDA',
        color: '#3730a3',
        bg: '#ede9fe',
        icon: '📦',
        description: 'La mercancía correspondiente a esta orden de compra fue recibida en el almacén.',
      },
      completed: {
        label: 'ORDEN COMPLETADA',
        color: '#065f46',
        bg: '#d1fae5',
        icon: '🏁',
        description: 'La orden de compra ha sido completada y cerrada exitosamente.',
      },
    };

    const cfg = STATUS_CONFIG[order.status];
    const fmt = (d: Date | string | null | undefined) =>
      d ? new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    const fmtCurrency = (n: number) =>
      '$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const linesRows = lines.map((line) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#111827;">
          <div style="font-weight:600;">${line.product?.name || 'Producto'}</div>
          ${line.product?.sku ? `<div style="color:#9ca3af;font-size:11px;margin-top:2px;">SKU: ${line.product.sku}</div>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#374151;text-align:center;">${line.quantityOrdered}</td>
        ${order.status === 'received' || order.status === 'completed' ? `
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#059669;text-align:center;font-weight:600;">${line.quantityReceived ?? 0}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#dc2626;text-align:center;">${line.quantityRejected ?? 0}</td>
        ` : ''}
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#374151;text-align:right;">${fmtCurrency(line.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#111827;font-weight:600;text-align:right;">${fmtCurrency(line.totalPrice)}</td>
      </tr>
    `).join('');

    const hasReceiptColumns = order.status === 'received' || order.status === 'completed';

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orden de Compra ${order.poNumber} — SCILIP</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 60%,#7c3aed 100%);padding:36px 40px;position:relative;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">SCILIP</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px;letter-spacing:0.5px;">SISTEMA DE CONTROL DE INDICADORES LOGÍSTICOS</div>
          </td>
          <td align="right">
            <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:4px;">ORDEN DE COMPRA</div>
            <div style="font-size:20px;font-weight:800;color:#ffffff;">${order.poNumber}</div>
          </td>
        </tr>
      </table>
      <!-- Status badge -->
      <div style="margin-top:24px;">
        <span style="display:inline-block;background:${cfg.bg};color:${cfg.color};padding:6px 16px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:0.5px;">
          ${cfg.icon} ${cfg.label}
        </span>
      </div>
    </div>

    <!-- STATUS DESCRIPTION -->
    <div style="background:${cfg.bg};border-left:4px solid ${cfg.color};padding:14px 20px;margin:0;">
      <p style="margin:0;font-size:13px;color:${cfg.color};line-height:1.5;">${cfg.description}</p>
      ${order.rejectionReason ? `<p style="margin:8px 0 0;font-size:12px;color:#991b1b;"><strong>Motivo del rechazo:</strong> ${order.rejectionReason}</p>` : ''}
    </div>

    <!-- GREETING -->
    <div style="padding:28px 40px 0;">
      <p style="font-size:14px;color:#374151;margin:0;">Estimado/a <strong style="color:#111827;">${recipientName}</strong>,</p>
      <p style="font-size:13px;color:#6b7280;margin:8px 0 0;line-height:1.6;">
        A continuación encontrará el detalle completo de la orden de compra <strong>${order.poNumber}</strong>.
      </p>
    </div>

    <!-- INFO GRID -->
    <div style="padding:20px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr style="background:#f9fafb;">
          <td colspan="4" style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;text-transform:uppercase;">
            Información de la Orden
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;width:25%;border-bottom:1px solid #f3f4f6;">Fecha de Orden</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${fmt(order.orderDate)}</td>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;width:25%;border-bottom:1px solid #f3f4f6;">Entrega Esperada</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${fmt(order.expectedDeliveryDate)}</td>
        </tr>
        ${order.actualDeliveryDate ? `
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;border-bottom:1px solid #f3f4f6;">Entrega Real</td>
          <td style="padding:12px 16px;font-size:12px;color:#059669;font-weight:700;border-bottom:1px solid #f3f4f6;">${fmt(order.actualDeliveryDate)}</td>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;border-bottom:1px solid #f3f4f6;"></td>
          <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;"></td>
        </tr>
        ` : ''}
        ${order.notes ? `
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;">Notas</td>
          <td colspan="3" style="padding:12px 16px;font-size:12px;color:#374151;">${order.notes}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- SUPPLIER INFO -->
    <div style="padding:0 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr style="background:#f9fafb;">
          <td colspan="4" style="padding:10px 16px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;text-transform:uppercase;">
            Datos del Proveedor
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;width:25%;border-bottom:1px solid #f3f4f6;">Razón Social</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;font-weight:700;border-bottom:1px solid #f3f4f6;">${supplier.name}</td>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;width:25%;border-bottom:1px solid #f3f4f6;">NIT / Tax ID</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${supplier.taxId || '—'}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;border-bottom:1px solid #f3f4f6;">Correo</td>
          <td style="padding:12px 16px;font-size:12px;color:#4f46e5;border-bottom:1px solid #f3f4f6;">${supplier.email || '—'}</td>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;border-bottom:1px solid #f3f4f6;">Teléfono</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;border-bottom:1px solid #f3f4f6;">${supplier.phone || '—'}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;">Contacto</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;">${supplier.contactPerson || '—'}</td>
          <td style="padding:12px 16px;font-size:11px;color:#9ca3af;font-weight:600;">Dirección</td>
          <td style="padding:12px 16px;font-size:12px;color:#111827;">${supplier.address || '—'}</td>
        </tr>
      </table>
    </div>

    <!-- LINE ITEMS -->
    <div style="padding:0 40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#1e1b4b;">
            <th style="padding:12px 12px;font-size:11px;font-weight:700;color:#c7d2fe;text-align:left;letter-spacing:0.4px;">PRODUCTO</th>
            <th style="padding:12px 12px;font-size:11px;font-weight:700;color:#c7d2fe;text-align:center;letter-spacing:0.4px;">CANT. PEDIDA</th>
            ${hasReceiptColumns ? `
            <th style="padding:12px 12px;font-size:11px;font-weight:700;color:#6ee7b7;text-align:center;letter-spacing:0.4px;">CANT. RECIBIDA</th>
            <th style="padding:12px 12px;font-size:11px;font-weight:700;color:#fca5a5;text-align:center;letter-spacing:0.4px;">CANT. RECHAZADA</th>
            ` : ''}
            <th style="padding:12px 12px;font-size:11px;font-weight:700;color:#c7d2fe;text-align:right;letter-spacing:0.4px;">PRECIO UNIT.</th>
            <th style="padding:12px 12px;font-size:11px;font-weight:700;color:#c7d2fe;text-align:right;letter-spacing:0.4px;">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${linesRows}
        </tbody>
        <tfoot>
          <tr style="background:#f9fafb;">
            <td colspan="${hasReceiptColumns ? 5 : 3}" style="padding:14px 12px;font-size:13px;font-weight:700;color:#374151;text-align:right;border-top:2px solid #e5e7eb;">
              TOTAL ORDEN:
            </td>
            <td style="padding:14px 12px;font-size:16px;font-weight:800;color:#4f46e5;text-align:right;border-top:2px solid #e5e7eb;">
              ${fmtCurrency(order.totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- FOOTER NOTE -->
    <div style="padding:0 40px 28px;">
      <p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0;">
        Este correo es una notificación automática generada por <strong>SCILIP</strong>. Por favor no responda a este mensaje directamente.
        Si tiene alguna consulta, comuníquese con el administrador del sistema.
      </p>
    </div>

    <!-- FOOTER BAR -->
    <div style="background:#1e1b4b;padding:20px 40px;text-align:center;">
      <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0;">
        SCILIP &copy; ${new Date().getFullYear()} &nbsp;·&nbsp; Sistema de Control de Indicadores Logísticos y de Ingeniería de Procesos
      </p>
    </div>

  </div>
</body>
</html>
    `;

    const subjectMap: Record<string, string> = {
      approved: `✅ Orden Aprobada: ${order.poNumber}`,
      rejected: `❌ Orden Rechazada: ${order.poNumber}`,
      received: `📦 Mercancía Recibida: ${order.poNumber}`,
      completed: `🏁 Orden Completada: ${order.poNumber}`,
    };

    return this.send([to], subjectMap[order.status] || `Orden de Compra: ${order.poNumber}`, html);
  }

  async sendReport(options: {
    to: string[];
    subject: string;
    body: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.log(`[SIMULADO] Reporte a ${options.to.join(', ')}: ${options.subject}`);
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"SCILIP" <${process.env.SMTP_USER}>`,
        to: options.to.join(', '),
        subject: options.subject,
        html: options.body,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Error enviando reporte: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
