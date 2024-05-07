import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@controllers';

/**
 * This is an auth guard that works based on the token passport strategy
 */
@Injectable()
export class UniqueTokenAuthGuard extends AuthGuard('token') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * It should allow routes that are marked as public without auth
   * @param context Current execution context
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
