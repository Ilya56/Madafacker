import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DataServiceAbstract, User } from '@core';
import { UniqueTokenPassportStrategy } from '../unique-token.passport-strategy';

describe('UniqueTokenPassportStrategy', () => {
  let strategy: UniqueTokenPassportStrategy;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniqueTokenPassportStrategy,
        {
          provide: DataServiceAbstract,
          useValue: {
            users: {
              getById: jest.fn(),
            },
            isInvalidUuidError: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<UniqueTokenPassportStrategy>(UniqueTokenPassportStrategy);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  describe('validate', () => {
    it('should return the user object when the user is found', async () => {
      const user = new User();
      user.id = '1';
      user.name = 'testuser';
      jest.spyOn(dataService.users, 'getById').mockResolvedValue(user);

      const result = await strategy.validate('1');
      expect(result).toEqual(user);
      expect(dataService.users.getById).toHaveBeenCalledWith('1');
    });

    it('should throw an UnauthorizedException when the user is not found', async () => {
      jest.spyOn(dataService.users, 'getById').mockResolvedValue(null);

      await expect(strategy.validate('nonexistent')).rejects.toThrow(UnauthorizedException);
      expect(dataService.users.getById).toHaveBeenCalledWith('nonexistent');
    });

    it('should throw a NotFoundException for invalid UUIDs', async () => {
      const error = new Error('Invalid UUID');
      jest.spyOn(dataService.users, 'getById').mockRejectedValue(error);
      jest.spyOn(dataService, 'isInvalidUuidError').mockReturnValue(true);

      await expect(strategy.validate('invalid-uuid')).rejects.toThrow(NotFoundException);
      expect(dataService.isInvalidUuidError).toHaveBeenCalledWith(error);
    });

    it('should rethrow the error if it is not an invalid UUID error', async () => {
      const error = new Error('Unexpected error');
      jest.spyOn(dataService.users, 'getById').mockRejectedValue(error);
      jest.spyOn(dataService, 'isInvalidUuidError').mockReturnValue(false);

      await expect(strategy.validate('some-id')).rejects.toThrow(error);
      expect(dataService.isInvalidUuidError).toHaveBeenCalledWith(error);
    });
  });
});
