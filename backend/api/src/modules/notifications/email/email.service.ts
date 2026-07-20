import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendReport(options: {
    to: string[];
    subject: string;
    body: string;
    attachments: Array<{ filename: string; content: Buffer }>;
  }) {
    this.logger.log(`Simulating sending email to ${options.to.join(', ')}: ${options.subject}`);
    // Aquí iría la integración con Nodemailer o AWS SES
    return { success: true };
  }
}
