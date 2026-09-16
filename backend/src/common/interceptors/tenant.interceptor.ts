import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 系统管理员可以访问所有租户数据
    if (user?.role === 'system_admin') {
      return next.handle();
    }

    // 商户管理员和用户只能访问自己租户的数据
    if (user?.tenantId) {
      request.tenantId = user.tenantId;
      return next.handle();
    }

    throw new ForbiddenException('无权访问该资源');
  }
}
