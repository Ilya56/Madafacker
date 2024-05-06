import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '@use-cases/user/create-user.use-case';
import { CreateUserDto } from './dtos';
import { User } from '@core';
import { UserFactoryService } from './factories';

/**
 * User actions controller. All related to the user should be here
 */
@Controller('api/user')
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase, private userFactoryService: UserFactoryService) {}

  /**
   * Creates new user
   * @param userDto new user data
   */
  @Post()
  create(@Body() userDto: CreateUserDto): Promise<User> {
    const user = this.userFactoryService.createNewUser(userDto);
    return this.createUserUseCase.execute(user);
  }
}
