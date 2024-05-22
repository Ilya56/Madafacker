import { QueryAbstract } from '@use-cases/abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetCurrentUserUseCase extends QueryAbstract<void, User> {
  /**
   * Returns current user entity
   * If no user returns null
   */
  public implementation(): Promise<User> {
    return this.userService.getCurrentUser();
  }
}
