import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { Role } from '../../enums/user-role';
import { ROLES_KEY } from '../decorators/roles.decorator';

import { Role } from 'src/roles/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log("requiredRoles:"+ requiredRoles);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log("role guard")
    console.log(user);
    const userRoles = user.roles;
    console.log("user role:");
    console.log(userRoles);

  return requiredRoles.some((role) => userRoles.includes(role));
  }
}

