import { DataServiceAbstract } from '../../core/absctract';
import { Injectable } from '@nestjs/common';
import { User } from '../../core';

@Injectable()
export class UserUseCase {
  constructor(private dataService: DataServiceAbstract) {}

  create(user: User): Promise<User> {
    return this.dataService.users.create(user);
  }
}
