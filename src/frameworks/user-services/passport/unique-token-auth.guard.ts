import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GeneralGuard } from '@controllers';

/**
 * This is an auth guard that works based on the token passport strategy
 */
@Injectable()
export class UniqueTokenAuthGuard extends AuthGuard('token') {
  constructor(private generalGuard: GeneralGuard) {
    super();
  }

  /**
   * It should allow routes that are marked as public without auth
   * @param context Current execution context
   */
  canActivate(context: ExecutionContext) {
    const canActivate = this.generalGuard.canActivate(context);
    if (canActivate === null) {
      return super.canActivate(context);
    }
    return canActivate;
  }
}
