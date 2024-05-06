import { CommandAbstract } from '@use-cases/abstract/command.abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase extends CommandAbstract<User, User> {
  /**
   * Creates new user in the system
   * @param user user entity to create
   */
  public implementation(user: User): Promise<User> {
    return this.dataService.users.create(user);
  }
}
