import { QueryAbstract } from '@use-cases/abstract';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckUsernameAvailableUseCase extends QueryAbstract<string, boolean> {
  /**
   * Returns true if user name is available.
   * @param name user name to check availability
   * @protected
   */
  protected async implementation(name: string): Promise<boolean> {
    const user = await this.dataService.users.getByName(name);
    return !user;
  }
}
