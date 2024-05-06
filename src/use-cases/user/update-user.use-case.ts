import { CommandAbstract } from '@use-cases/abstract/command.abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

type UpdateUserInput = {
  id: string;
  user: User;
};

@Injectable()
export class UpdateUserUseCase extends CommandAbstract<UpdateUserInput, User> {
  /**
   * Updates user data
   * @param id id of user to update
   * @param user new user data
   */
  protected implementation({ id, user }: UpdateUserInput): Promise<User> {
    return this.dataService.users.update(id, user);
  }
}
