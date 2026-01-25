import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos desde los metadatos del handler actual
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()); // Asegúrate de que 'roles' es el metadato correcto

    // Si no hay roles requeridos, retorna false para negar el acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return false;
    }

    // Obtener el usuario desde el objeto request
    const { user } = context.switchToHttp().getRequest();

    // Verificar que el usuario esté definido y tenga una propiedad 'role'
    if (!user || !user.role) {
      return false; // Retorna false si el usuario o su rol no están definidos
    }

    // Verificar si alguno de los roles requeridos está incluido en el rol del usuario
    const hasRole = requiredRoles.some(role => user.role.includes(role));

    return hasRole; // Retorna true si el usuario tiene el rol necesario, false en caso contrario
  }
}
