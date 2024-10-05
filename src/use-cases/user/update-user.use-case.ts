import { CommandAbstract } from '@use-cases/abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateUserUseCase extends CommandAbstract<User, User | null> {
  /**
   * Updates current user data and returns updated user or null if user not found
   * @param user new user data
   */
  protected async implementation(user: User): Promise<User | null> {
    const currentUser = await this.userService.getCurrentUser();
    return this.dataService.users.update(currentUser.id, user);
  }
}
