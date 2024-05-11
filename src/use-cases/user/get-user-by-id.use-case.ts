import { QueryAbstract } from '@use-cases/abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';


@Injectable()
export class GetUserByIdUseCase extends QueryAbstract<Record<string, never>, User> {
  /**
   * Returns current user entity
   * If no user returns null
   */
  public implementation(): Promise<User> {
    return this.userService.getCurrentUser();
  }
}
