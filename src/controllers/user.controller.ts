import { Body, Controller, Post } from '@nestjs/common';
import { UserUseCase } from '../use-cases/user/user.use-case';
import { CreateUserDto } from './dtos';
import { User } from '../core';
import { UserFactoryService } from './factories';

/**
 * User actions controller. All related to the user should  be here
 */
@Controller('api/user')
export class UserController {
  constructor(private userUseCase: UserUseCase, private userFactoryService: UserFactoryService) {}

  /**
   * Creates new user
   * @param userDto new user data
   */
  @Post()
  create(@Body() userDto: CreateUserDto): Promise<User> {
    const user = this.userFactoryService.createNewUser(userDto);
    return this.userUseCase.create(user);
  }
}
