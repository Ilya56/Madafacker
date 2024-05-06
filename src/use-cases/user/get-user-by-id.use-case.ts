import { QueryAbstract } from '@use-cases/abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

type GetByIdOutput = User | null;

@Injectable()
export class GetUserByIdUseCase extends QueryAbstract<Record<string, never>, GetByIdOutput> {
  /**
   * Returns current user entity
   * If no user returns null
   */
  public async implementation(): Promise<GetByIdOutput> {
    const id = await this.userService.getCurrentUserId();
    return this.dataService.users.getById(id);
  }
}
