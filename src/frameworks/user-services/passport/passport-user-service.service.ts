import { DataServiceAbstract, GetUserOptions, NotFoundError, User, UserServiceAbstract } from '@core';
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
   * @param dataService data service to manipulate with data
   */
  constructor(
    @Inject(REQUEST) private readonly request: UserRequest,
    private readonly dataService: DataServiceAbstract,
  ) {
    super();
  }

  /**
   * Returns a current user object from the request object
   * If no user in request - throw not found error
   * @param options user options
   */
  async getCurrentUser(options?: GetUserOptions): Promise<User> {
    const user = this.request.user;
    if (!user) {
      throw new NotFoundError('Current user not found');
    }

    if (options?.withIncomingMessages) {
      user.incomeMessages = await this.dataService.messages.getIncomingByUserId(user.id);
    }

    if (options?.withOutcomingMessages) {
      user.outcomeMessages = await this.dataService.messages.getOutcomingByUserId(user.id);
    }

    return user;
  }
}
