import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Si no hay usuario o no tiene rol, denegar
    if (!user || !user.role) {
      return false;
    }

    // Permitir si el usuario tiene uno de los roles requeridos
    return roles.includes(user.role.name.toLowerCase()) || roles.includes('admin');
  }
}
