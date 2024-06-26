import { ExecutionContext, Injectable } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@controllers';
import { Reflector } from '@nestjs/core';

/**
 * This guard is created to store all common guard logic that is not depend on the implementation
 */
@Injectable()
export class GeneralGuard {
  constructor(private reflector: Reflector) {}

  /**
   * This function returns true or false based on the general rules.
   * Also, it can return null as a result if framework guard should be used.
   * Because of it, this class cannot implement CanActivate interface
   * @param context Current execution context
   */
  canActivate(context: ExecutionContext): boolean | null {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return null;
  }
}
