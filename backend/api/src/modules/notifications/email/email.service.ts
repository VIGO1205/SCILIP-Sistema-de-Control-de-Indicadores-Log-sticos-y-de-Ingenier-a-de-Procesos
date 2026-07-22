import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"SCILIP" <${process.env.SMTP_USER}>`,
        to: to.join(', '),
        subject,
        html,
      });
      this.logger.log(`Email enviado: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Error enviando email: ${error.message}`);
      return { success: false, error: error.message };
    }
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
