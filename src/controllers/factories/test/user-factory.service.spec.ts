import { Test, TestingModule } from '@nestjs/testing';
import { UserFactoryService } from '../user-factory.service';
import { CreateUserDto, UpdateUserDto } from '../../dtos';
import { User } from '@core';

describe('UserFactoryService', () => {
  let userFactoryService: UserFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFactoryService],
    }).compile();

    userFactoryService = module.get<UserFactoryService>(UserFactoryService);
  });

  describe('createNewUser', () => {
    it('should create a new user with the correct name from CreateUserDto', () => {
      const createUserDto: CreateUserDto = { name: 'John Doe' };

      const expectedUser = new User();
      expectedUser.name = 'John Doe';

      const result = userFactoryService.createNewUser(createUserDto);

      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(expectedUser.name);
    });
  });

  describe('updateUser', () => {
    it('should update a user with the correct name from UpdateUserDto', () => {
      const updateUserDto: UpdateUserDto = { name: 'Jane Doe' };
      const expectedUser = new User();
      expectedUser.name = 'Jane Doe';

      const result = userFactoryService.updateUser(updateUserDto);

      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(updateUserDto.name);
    });
  });
});
