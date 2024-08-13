import { PassportStrategy } from '@nestjs/passport';
import { UniqueTokenStrategy } from 'passport-unique-token';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataServiceAbstract, User } from '@core';

/**
 * Implementation of the password unique token strategy
 */
@Injectable()
export class UniqueTokenPassportStrategy extends PassportStrategy(UniqueTokenStrategy) {
  constructor(private dataService: DataServiceAbstract) {
    super({});
  }

  /**
   * Validates that user is available. If no - throw 403 error. If yes - return user object
   * Is useful for an auth guard
   * @param id user id to validate
   */
  async validate(id: string): Promise<User> {
    try {
      const user = await this.dataService.users.getById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (e) {
      if (this.dataService.isInvalidUuidError(e)) {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}
