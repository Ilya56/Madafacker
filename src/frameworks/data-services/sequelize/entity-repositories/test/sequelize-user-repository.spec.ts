import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeUserRepository } from '../sequelize-user-repository';
import { IncomeUserMessagesModel, UserModel } from '../../models';
import { Message } from '@core';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

describe('SequelizeUserRepository', () => {
  let userRepository: SequelizeUserRepository;
  const sequelize = new Sequelize({
    dialect: 'postgres',
    storage: ':memory:',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SequelizeUserRepository,
          useValue: new SequelizeUserRepository(sequelize),
        },
        {
          provide: UserModel,
          useValue: {
            update: jest.fn(),
            count: jest.fn(),
            findAll: jest.fn(),
            increment: jest.fn(),
          },
        },
        {
          provide: IncomeUserMessagesModel,
          useValue: {
            count: jest.fn(),
            bulkCreate: jest.fn(),
          },
        },
      ],
    }).compile();

    userRepository = module.get<SequelizeUserRepository>(SequelizeUserRepository);
  });

  describe('getValidUsersCount', () => {
    it('should return the total number of users', async () => {
      jest.spyOn(UserModel, 'count').mockResolvedValue(10);
      const result = await userRepository.getValidUsersCount();
      expect(result).toEqual(10);
      expect(UserModel.count).toHaveBeenCalledWith({ where: { tokenIsInvalid: false } });
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

  describe('getRandomUserIds', () => {
    it('should retrieve random user IDs', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }, { id: '3' }];
      jest.spyOn(UserModel, 'findAll').mockResolvedValue(mockUsers as any);
      jest.spyOn(sequelize, 'random').mockReturnValue('RANDOM()' as any);

      const quantity = 3;
      const result = await userRepository.getRandomValidUserIds(quantity);

      expect(result).toEqual(['1', '2', '3']);
      expect(UserModel.findAll).toHaveBeenCalledWith({
        where: { tokenIsInvalid: false },
        order: 'RANDOM()',
        limit: quantity,
        attributes: ['id'],
      });
    });
  });

  describe('sendMessageToUsers', () => {
    it('should send a message to specified users', async () => {
      const message = { id: 'msg1' } as Message;
      const userIds = ['user1', 'user2', 'user3'];
      const expectedBulkCreateData = userIds.map((userId) => ({
        userId,
        messageId: message.id,
      }));

      jest.spyOn(IncomeUserMessagesModel, 'bulkCreate').mockResolvedValue([]);

      await userRepository.sendMessageToUsers(message, userIds);

      expect(IncomeUserMessagesModel.bulkCreate).toHaveBeenCalledWith(expectedBulkCreateData);
    });
  });

  describe('addCoins', () => {
    it("should increment the user's coins by the specified number", async () => {
      const userId = 'user1';
      const coinsNumber = 10;
      const newCoinsValue: [UserModel[], number] = [[{} as UserModel], 50]; // Mocked increment response

      jest.spyOn(UserModel, 'increment').mockResolvedValue(newCoinsValue);

      const result = await userRepository.addCoins(userId, coinsNumber);

      expect(UserModel.increment).toHaveBeenCalledWith(
        { coins: coinsNumber },
        { where: { id: userId }, returning: true },
      );
      expect(result).toEqual(50);
    });

    it('should return 0 if no new coins value is returned', async () => {
      const userId = 'user1';
      const coinsNumber = 10;
      const newCoinsValue: [UserModel[]] = [[{} as UserModel]]; // Mocked increment response with no value

      jest.spyOn(UserModel, 'increment').mockResolvedValue(newCoinsValue);

      const result = await userRepository.addCoins(userId, coinsNumber);

      expect(UserModel.increment).toHaveBeenCalledWith(
        { coins: coinsNumber },
        { where: { id: userId }, returning: true },
      );
      expect(result).toEqual(0);
    });
  });

  describe('getByName', () => {
    it('should return the user with the specified name', async () => {
      const mockUser = { id: '1', name: 'John Doe' } as UserModel;
      jest.spyOn(UserModel, 'findOne').mockResolvedValue(mockUser as any);

      const result = await userRepository.getByName('John Doe');

      expect(result).toEqual(mockUser);
      expect(UserModel.findOne).toHaveBeenCalledWith({
        where: { name: 'John Doe' },
      });
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue(null);

      const result = await userRepository.getByName('NonExistentUser');

      expect(result).toBeNull();
      expect(UserModel.findOne).toHaveBeenCalledWith({
        where: { name: 'NonExistentUser' },
      });
    });
  });

  describe('markTokensAsInvalid', () => {
    it('should mark a single user token as invalid', async () => {
      const userId = 'user1';
      jest.spyOn(UserModel, 'update').mockResolvedValue([1]); // Mock update response

      await userRepository.markTokensAsInvalid(userId);

      expect(UserModel.update).toHaveBeenCalledWith({ tokenIsInvalid: true }, { where: { id: { [Op.in]: [userId] } } });
    });

    it('should mark multiple user tokens as invalid', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      jest.spyOn(UserModel, 'update').mockResolvedValue([userIds.length]); // Mock update response

      await userRepository.markTokensAsInvalid(userIds);

      expect(UserModel.update).toHaveBeenCalledWith({ tokenIsInvalid: true }, { where: { id: { [Op.in]: userIds } } });
    });
  });

  describe('update', () => {
    it('should update the user with provided data', async () => {
      const userId = 'user1';
      const userData = { name: 'Jane Doe' };
      const updatedUser = { id: userId, ...userData, tokenIsInvalid: false } as UserModel;
      jest.spyOn(UserModel, 'update').mockResolvedValue([1, [updatedUser]] as any);

      const result = await userRepository.update(userId, userData);

      expect(UserModel.update).toHaveBeenCalledWith(userData, { where: { id: userId }, returning: true });
      expect(result).toEqual(updatedUser);
    });

    it('should mark token as valid if registrationToken is provided', async () => {
      const userId = 'user1';
      const userData = { registrationToken: 'newToken' };
      const updatedUser = { id: userId, ...userData, tokenIsInvalid: false } as UserModel;
      jest.spyOn(UserModel, 'update').mockResolvedValue([1, [updatedUser]] as any);

      const result = await userRepository.update(userId, userData);

      expect(UserModel.update).toHaveBeenCalledWith(
        { ...userData, tokenIsInvalid: false },
        { where: { id: userId }, returning: true },
      );
      expect(result).toEqual(updatedUser);
    });
  });
});
