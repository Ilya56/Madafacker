import { DataServiceAbstract } from '../../core/absctract';
import { Injectable } from '@nestjs/common';
import { User } from '../../core';

/**
 * User use case is a class that knows everything about user and how to work with user.
 * It implements the business logic of the user
 */
@Injectable()
export class UserUseCase {
  /**
   * It uses other services to work with system
   * @param dataService allow to manipulate data in the data storage
   */
  constructor(private dataService: DataServiceAbstract) {}

  /**
   * Creates new user in the system
   * @param user user entity to create
   */
  create(user: User): Promise<User> {
    return this.dataService.users.create(user);
  }

  /**
   * Returns user based on the user id.
   * If no user - returns null
   * @param id of the user to search
   */
  getById(id: string): Promise<User | null> {
    return this.dataService.users.getById(id);
  }

  /**
   * Updates user data
   * @param id id of user to update
   * @param user new user data
   */
  update(id: string, user: User): Promise<User> {
    return this.dataService.users.update(id, user);
  }
}
