import { Body, Controller, Get, NotFoundException, Patch, Post, Query } from '@nestjs/common';
import {
  CreateUserUseCase,
  GetCurrentUserUseCase,
  UpdateUserUseCase,
  CheckUsernameAvailableUseCase,
} from '@use-cases/user';
import { CheckNameAvailableDto, CreateUserDto, NameIsAvailableResponseDto, UpdateUserDto } from './dtos';
import { User } from '@core';
import { UserFactoryService } from './factories';
import { Public } from './auth';
import { objectIsEmpty } from '@utils/object-is-empty';

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
    private checkUsernameAvailableUseCase: CheckUsernameAvailableUseCase,
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
    return await this.getUserByIdUseCase.execute();
  }

  /**
   * Updates current user data
   * If no data to update - return current user
   * @param updateUserDto updated user data
   */
  @Patch('/current')
  async update(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    const user = this.userFactoryService.updateUser(updateUserDto);

    if (objectIsEmpty(user)) {
      return this.getUserByIdUseCase.execute();
    }

    const updatedUser = await this.updateUserUseCase.execute(user);

    if (!updatedUser) {
      throw new NotFoundException('Current user not found');
    }

    return updatedUser;
  }

  /**
   * Checks that given name is available to create a user
   * @param query query object with name to check
   */
  @Public()
  @Get('/check-name-availability')
  async checkNameAvailable(@Query() query: CheckNameAvailableDto): Promise<NameIsAvailableResponseDto> {
    const nameIsAvailable = await this.checkUsernameAvailableUseCase.execute(query.name);

    return {
      nameIsAvailable,
    };
  }
}
