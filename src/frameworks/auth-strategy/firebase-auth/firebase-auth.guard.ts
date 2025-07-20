import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ClsData, GeneralGuard, IS_REGISTRATION_KEY } from '@controllers';
import { ClsService } from 'nestjs-cls';
import { Reflector } from '@nestjs/core';

/**
 * This is an auth guard that works based on the token passport strategy
 * Adds user in the cls context in the end instead of saving it to the request
 * This is done to avoid request scoped injections
 */
@Injectable()
export class FirebaseAuthGuard extends AuthGuard('firebase-jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly generalGuard: GeneralGuard,
    private readonly cls: ClsService<ClsData>,
  ) {
    super();
  }

  /**
   * It should allow routes that are marked as public without auth
   * @param context Current execution context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = this.generalGuard.canActivate(context);

    if (canActivate === null) {
      const isRegistrationEndpoint = this.reflector.getAllAndOverride<boolean>(IS_REGISTRATION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isRegistrationEndpoint) {
        this.cls.set('isRegistrationEndpoint', true);
      }

      const result = (await super.canActivate(context)) as boolean;
      const request = this.getRequest(context);
      // use cls instead of req.user
      this.cls.set('user', request.user);
      return result;
    }

    return canActivate;
  }
}
