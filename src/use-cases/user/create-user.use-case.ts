import { CommandAbstract } from '@use-cases/abstract';
import { InvalidNotifyServiceTokenException, User } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase extends CommandAbstract<User, User> {
  /**
   * Creates new user in the system
   * @param user user entity to create
   */
  protected async implementation(user: User): Promise<User> {
    const tokenIsValid = await this.notifyService.verifyToken(user.registrationToken);
    if (!tokenIsValid) {
      throw new InvalidNotifyServiceTokenException('Invalid registration token', user.registrationToken);
    }

    return this.dataService.users.create(user);
  }
}
