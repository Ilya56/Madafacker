import { CommandAbstract } from '@use-cases/abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase extends CommandAbstract<User, User> {
  /**
   * Creates new user in the system
   * @param user user entity to create
   */
  protected implementation(user: User): Promise<User> {
    return this.dataService.users.create(user);
  }
}
