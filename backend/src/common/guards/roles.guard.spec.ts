import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(user: any): any {
  return {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  };
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('deja pasar cuando la ruta no exige roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(makeContext({ role: { name: 'estudiante' } }))).toBe(true);
  });

  it('permite el acceso si el usuario tiene un rol requerido', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'docente']);
    expect(guard.canActivate(makeContext({ role: { name: 'docente' } }))).toBe(true);
  });

  it('lanza ForbiddenException si el rol no coincide', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeContext({ role: { name: 'estudiante' } })))
      .toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException si no hay usuario autenticado', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeContext(null))).toThrow(ForbiddenException);
  });
});
