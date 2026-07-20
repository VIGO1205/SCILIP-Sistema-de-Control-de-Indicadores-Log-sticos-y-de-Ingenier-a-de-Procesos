import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

    // Solo auditar métodos que modifican datos
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: async (data) => {
          try {
            const entityType = this.extractEntityType(url);
            
            await this.prisma.auditLog.create({
              data: {
                userId: user?.id || null,
                action: method,
                entityType,
                entityId: data?.id?.toString() || body?.id?.toString() || null,
                newValues: body ? JSON.parse(JSON.stringify(body)) : {},
                ipAddress: ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress,
                userAgent: request.headers['user-agent'] || 'unknown',
              },
            });
          } catch (error) {
            this.logger.error(`Error saving audit log: ${error.message}`);
          }
        },
      }),
    );
  }

  private extractEntityType(url: string): string {
    const parts = url.split('?')[0].split('/');
    // Asumiendo /api/v1/resource o /resource
    return parts.length > 2 ? parts[2] : parts[1] || 'unknown';
  }
}
