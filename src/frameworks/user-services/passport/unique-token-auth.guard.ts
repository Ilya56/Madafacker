import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ClsData, GeneralGuard } from '@controllers';
import { ClsService } from 'nestjs-cls';

/**
 * This is an auth guard that works based on the token passport strategy
 * Adds user in the cls context in the end instead of saving it to the request
 * This is done to avoid request scoped injections
 */
@Injectable()
export class UniqueTokenAuthGuard extends AuthGuard('token') {
  constructor(private generalGuard: GeneralGuard, private readonly cls: ClsService<ClsData>) {
    super();
  }

  /**
   * It should allow routes that are marked as public without auth
   * @param context Current execution context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = this.generalGuard.canActivate(context);
    if (canActivate === null) {
      const result = (await super.canActivate(context)) as boolean;
      const request = this.getRequest(context);
      // use cls instead of req.user
      this.cls.set('user', request.user);
      return result;
    }
    return canActivate;
  }
}
