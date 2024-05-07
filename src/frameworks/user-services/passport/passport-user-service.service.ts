import { User, UserServiceAbstract } from '@core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

type UserRequest = Request & { user: User };

/**
 * Implementation of the User service based on the password auth framework
 */
@Injectable({ scope: Scope.REQUEST })
export class PassportUserServiceService extends UserServiceAbstract {
  /**
   * It requires to get a request object each usage
   * @param request system request object
   */
  constructor(@Inject(REQUEST) private request: UserRequest) {
    super();
  }

  async getCurrentUser(): Promise<User> {
    return this.request.user;
  }
}
