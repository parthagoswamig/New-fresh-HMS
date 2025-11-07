import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.params.tenantId || request.body.tenantId || request.query.tenantId;

    // Super admin can access all tenants
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if user belongs to the tenant
    if (tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    // Attach tenantId to request for easy access
    request.tenantId = user.tenantId;
    return true;
  }
}
