import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { User } from '@core';

/**
 * This class is created to process data from HTTP to Entity
 */
@Injectable()
export class UserFactoryService {
  /**
   * Creates and returns new user entity based on the creation user dto
   * @param createUserDto create user data from request
   */
  createNewUser(createUserDto: CreateUserDto): User {
    const user = new User();
    user.name = createUserDto.name;
    user.registrationToken = createUserDto.registrationToken;
    return user;
  }

  /**
   * Creates and returns update user entity base on the update user dto
   * @param updateUserDto update user data from request
   */
  updateUser(updateUserDto: UpdateUserDto): User {
    const user = new User();
    user.name = updateUserDto.name;
    return user;
  }
}
