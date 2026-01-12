import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateUserUseCase,
  GetCurrentUserUseCase,
  UpdateUserUseCase,
  CheckUsernameAvailableUseCase,
} from '@use-cases/user';
import {
  CheckNameAvailableDto,
  CreateUserDto,
  NameIsAvailableResponseDto,
  UpdateUserDto,
  PrivateUserDto,
} from './dtos';
import { UserFactoryService } from './factories';
import { Public } from './auth';
import { objectIsEmpty } from '@utils/object-is-empty';
import { Registration } from './auth';
import { plainToInstance } from 'class-transformer';

/**
 * User actions controller. All related to the user should be here
 */
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true })
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
  @Registration()
  @Post()
  async create(@Body() userDto: CreateUserDto): Promise<PrivateUserDto> {
    const user = this.userFactoryService.createNewUser(userDto);
    const createdUser = await this.createUserUseCase.execute(user);
    return plainToInstance(PrivateUserDto, createdUser);
  }

  /**
   * Returns current user entity
   */
  @Get('/current')
  async retrieve(): Promise<PrivateUserDto> {
    const user = await this.getUserByIdUseCase.execute();
    return plainToInstance(PrivateUserDto, user);
  }

  /**
   * Updates current user data
   * If no data to update - return current user
   * @param updateUserDto updated user data
   */
  @Patch('/current')
  async update(@Body() updateUserDto: UpdateUserDto): Promise<PrivateUserDto> {
    const user = this.userFactoryService.updateUser(updateUserDto);

    if (objectIsEmpty(user)) {
      const currentUser = await this.getUserByIdUseCase.execute();
      return plainToInstance(PrivateUserDto, currentUser);
    }

    const updatedUser = await this.updateUserUseCase.execute(user);

    if (!updatedUser) {
      throw new NotFoundException('Current user not found');
    }

    return plainToInstance(PrivateUserDto, updatedUser);
  }

  /**
   * Checks that given name is available to create a user
   * @param query query object with name to check
   */
  @Public()
  @Get('/check-name-availability')
  async checkNameAvailable(@Query() query: CheckNameAvailableDto): Promise<NameIsAvailableResponseDto> {
    const nameIsAvailable = await this.checkUsernameAvailableUseCase.execute(query.name);

    return plainToInstance(NameIsAvailableResponseDto, {
      nameIsAvailable,
    });
  }
}
