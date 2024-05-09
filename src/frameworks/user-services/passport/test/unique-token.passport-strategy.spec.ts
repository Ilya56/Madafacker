import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
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
  });
});
