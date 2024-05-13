import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeUserRepository } from '../sequelize-user-repository';
import { IncomeUserMessagesModel, UserModel } from '@frameworks/data-services/sequelize';
import { User } from '@core';

describe('SequelizeUserRepository', () => {
  let userRepository: SequelizeUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SequelizeUserRepository,
        {
          provide: UserModel,
          useValue: {
            update: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: IncomeUserMessagesModel,
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    userRepository = module.get<SequelizeUserRepository>(SequelizeUserRepository);
  });

  describe('updateByName', () => {
    it('should update a user by name and return the updated user', async () => {
      const name = 'John Doe';

      const userUpdateInfo = new User();
      userUpdateInfo.name = 'Test';

      const updatedUser = { name: 'Test' };

      jest.spyOn(UserModel, 'update').mockResolvedValue([1, [updatedUser]] as never as [number]);

      const result = await userRepository.updateByName(name, userUpdateInfo);

      expect(result).toEqual(updatedUser);
      expect(UserModel.update).toHaveBeenCalledWith(userUpdateInfo, {
        where: { name },
        returning: true,
      });
    });

    it('should return null if no user is updated', async () => {
      const name = 'Nonexistent User';
      const userUpdateInfo = new User();
      userUpdateInfo.name = 'Test';

      // Mock the update method to simulate Sequelize behavior
      jest.spyOn(UserModel, 'update').mockResolvedValue([0, []] as never as [number]);

      const result = await userRepository.updateByName(name, userUpdateInfo);

      expect(result).toBeUndefined();
      expect(UserModel.update).toHaveBeenCalledWith(userUpdateInfo, {
        where: { name },
        returning: true,
      });
    });
  });

  describe('getTotalUsersCount', () => {
    it('should return the total number of users', async () => {
      jest.spyOn(UserModel, 'count').mockResolvedValue(10);
      const result = await userRepository.getTotalUsersCount();
      expect(result).toEqual(10);
      expect(UserModel.count).toHaveBeenCalled();
    });
  });

  describe('getUsersAlreadySeeMessageCount', () => {
    it('should return the count of users who have seen a specific message', async () => {
      const messageId = 'abc123';
      jest.spyOn(IncomeUserMessagesModel, 'count').mockResolvedValue(5);
      const result = await userRepository.getUsersAlreadySeeMessageCount(messageId);
      expect(result).toEqual(5);
      expect(IncomeUserMessagesModel.count).toHaveBeenCalledWith({ where: { messageId } });
    });
  });
});
