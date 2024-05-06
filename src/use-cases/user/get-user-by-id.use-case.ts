import { QueryAbstract } from '@use-cases/abstract/query.abstract';
import { User } from '@core';
import { Injectable } from '@nestjs/common';

type GetByIdInput = {
  id: string;
}

type GetByIdOutput = User | null;

@Injectable()
export class GetUserByIdUseCase extends QueryAbstract<GetByIdInput, GetByIdOutput> {
  /**
   * Returns user based on the user id.
   * If no user - returns null
   * @param id of the user to search
   */
  public implementation({ id }: GetByIdInput): Promise<GetByIdOutput> {
    return this.dataService.users.getById(id);
  }
}
