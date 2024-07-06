import { DataServiceAbstract, GetUserOptions, NotFoundError, User, UserServiceAbstract } from '@core';
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ClsData } from '@controllers';

/**
 * Implementation of the User service based on the password auth framework
 */
@Injectable()
export class PassportUserServiceService extends UserServiceAbstract {
  /**
   * It requires to get a request object each usage
   * @param cls CLS module to manipulate user and avoid request scoped injection
   * @param dataService data service to manipulate with data
   */
  constructor(private readonly cls: ClsService<ClsData>, private readonly dataService: DataServiceAbstract) {
    super();
  }

  /**
   * Returns a current user object from the request object
   * If no user in request - throw not found error
   * @param options user options
   */
  async getCurrentUser(options?: GetUserOptions): Promise<User> {
    const user = this.cls.get('user');
    if (!user) {
      throw new NotFoundError('Current user not found');
    }

    if (options?.withIncomingMessages) {
      user.incomeMessages = await this.dataService.messages.getIncomingByUserId(user.id, 1);
    }

    if (options?.withOutcomingMessages) {
      user.outcomeMessages = await this.dataService.messages.getOutcomingByUserId(user.id, 1);
    }

    return user;
  }
}
