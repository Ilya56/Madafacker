import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { CreateUserUseCase } from '@use-cases/user/create-user.use-case';
import { CreateUserDto } from './dtos';
import { User } from '@core';
import { UserFactoryService } from './factories';
import { GetUserByIdUseCase } from '@use-cases/user/get-user-by-id.use-case';

/**
 * User actions controller. All related to the user should be here
 */
@Controller('api/user')
export class UserController {
  constructor(
    private userFactoryService: UserFactoryService,
    private createUserUseCase: CreateUserUseCase,
    private getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  /**
   * Creates new user
   * @param userDto new user data
   */
  @Post()
  create(@Body() userDto: CreateUserDto): Promise<User> {
    const user = this.userFactoryService.createNewUser(userDto);
    return this.createUserUseCase.execute(user);
  }

  /**
   * Returns current user entity
   */
  @Get('/current')
  async retrieve(): Promise<User> {
    const user = await this.getUserByIdUseCase.execute({});

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
