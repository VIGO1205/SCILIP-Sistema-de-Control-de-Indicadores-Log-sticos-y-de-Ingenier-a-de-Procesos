import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class TrpcAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const payload = this.jwtService.verify<{ sub: string }>(auth.slice(7));
        const user = await this.authService.validateJwtPayload(payload);
        (req as Request & { user: typeof user & { companyId?: string } }).user = {
          ...user,
          companyId: user.companyId || undefined,
        };
      } catch (error) {
        console.error('Error verifying JWT in tRPC Middleware:', error);
      }
    }
    next();
  }
}
