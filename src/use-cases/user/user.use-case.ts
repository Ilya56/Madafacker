import { DataServiceAbstract } from '../../core/absctract';
import { Injectable } from '@nestjs/common';
import { User } from '../../core';

@Injectable()
export class UserUseCase {
  constructor(private dataService: DataServiceAbstract) {}

  create(user: User): Promise<User> {
    return this.dataService.users.create(user);
  }

  getById(id: string): Promise<User> {
    return this.dataService.users.getById(id);
  }

  update(id: string, user: User): Promise<void> {
    return this.dataService.users.update(id, user);
  }
}
