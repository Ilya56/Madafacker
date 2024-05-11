import { Body, Controller, Get, NotFoundException, Patch, Post } from '@nestjs/common';
import { CreateUserUseCase, GetCurrentUserUseCase, UpdateUserUseCase } from '@use-cases/user';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { User } from '@core';
import { UserFactoryService } from './factories';
import { Public } from './auth';

/**
 * User actions controller. All related to the user should be here
 */
@Controller('api/user')
export class UserController {
  constructor(
    private userFactoryService: UserFactoryService,
    private createUserUseCase: CreateUserUseCase,
    private getUserByIdUseCase: GetCurrentUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
  ) {}

  /**
   * Creates new user
   * @param userDto new user data
   */
  @Public()
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
    return await this.getUserByIdUseCase.execute({});
  }

  /**
   * Updates current user data
   * @param updateUserDto updated user data
   */
  @Patch('/current')
  async update(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    const user = this.userFactoryService.updateUser(updateUserDto);
    const updatedUser = await this.updateUserUseCase.execute(user);

    if (!updatedUser) {
      throw new NotFoundException('Current user not found');
    }

    return updatedUser;
  }
}
