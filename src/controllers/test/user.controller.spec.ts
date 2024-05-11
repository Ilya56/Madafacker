import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto, UpdateUserDto, UserController } from '@controllers';
import { CreateUserUseCase, GetUserByIdUseCase, UpdateUserUseCase } from '@use-cases/user';
import { UserFactoryService } from '../factories';
import { User } from '@core';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userFactoryService: UserFactoryService;
  let createUserUseCase: CreateUserUseCase;
  let getUserByIdUseCase: GetUserByIdUseCase;
  let updateUserUseCase: UpdateUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserFactoryService,
          useValue: {
            createNewUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userFactoryService = module.get<UserFactoryService>(UserFactoryService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    getUserByIdUseCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  describe('create', () => {
    it('should create a user and return the created entity', async () => {
      const mockUserDto: CreateUserDto = { name: 'John Doe' };
      const expectedUser = new User();

      jest.spyOn(userFactoryService, 'createNewUser').mockReturnValue(expectedUser);
      jest.spyOn(createUserUseCase, 'execute').mockResolvedValue(expectedUser);

      const result = await userController.create(mockUserDto);

      expect(result).toEqual(expectedUser);
      expect(userFactoryService.createNewUser).toHaveBeenCalledWith(mockUserDto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('retrieve', () => {
    it('should retrieve the current user', async () => {
      const expectedUser = new User();

      jest.spyOn(getUserByIdUseCase, 'execute').mockResolvedValue(expectedUser);

      const result = await userController.retrieve();

      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update the user and return the updated user', async () => {
      const mockUpdateUserDto: UpdateUserDto = { name: 'Jane Doe' };
      const expectedUser = new User();
      jest.spyOn(userFactoryService, 'updateUser').mockReturnValue(expectedUser);
      jest.spyOn(updateUserUseCase, 'execute').mockResolvedValue(expectedUser);

      const result = await userController.update(mockUpdateUserDto);

      expect(result).toEqual(expectedUser);
      expect(userFactoryService.updateUser).toHaveBeenCalledWith(mockUpdateUserDto);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith(expectedUser);
    });

    it('should throw a NotFoundException if the update does not find the user', async () => {
      const mockUpdateUserDto: UpdateUserDto = { name: 'Jane Doe' };

      jest.spyOn(userFactoryService, 'updateUser').mockReturnValue(new User());
      jest.spyOn(updateUserUseCase, 'execute').mockResolvedValue(null);

      await expect(userController.update(mockUpdateUserDto)).rejects.toThrow(
        new NotFoundException('Current user not found'),
      );
    });
  });
});
