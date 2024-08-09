import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeUserRepository } from '../sequelize-user-repository';
import { IncomeUserMessagesModel, UserModel } from '../../models';
import { Message } from '@core';
import { Sequelize } from 'sequelize-typescript';

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

  describe('getRandomUserIds', () => {
    it('should retrieve random user IDs', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }, { id: '3' }];
      jest.spyOn(UserModel, 'findAll').mockResolvedValue(mockUsers as any);
      jest.spyOn(sequelize, 'random').mockReturnValue('RANDOM()' as any);

      const quantity = 3;
      const result = await userRepository.getRandomUserIds(quantity);

      expect(result).toEqual(['1', '2', '3']);
      expect(UserModel.findAll).toHaveBeenCalledWith({
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

      expect(UserModel.increment).toHaveBeenCalledWith({ coins: coinsNumber }, { where: { id: userId } });
      expect(result).toEqual(50);
    });

    it('should return 0 if no new coins value is returned', async () => {
      const userId = 'user1';
      const coinsNumber = 10;
      const newCoinsValue: [UserModel[]] = [[{} as UserModel]]; // Mocked increment response with no value

      jest.spyOn(UserModel, 'increment').mockResolvedValue(newCoinsValue);

      const result = await userRepository.addCoins(userId, coinsNumber);

      expect(UserModel.increment).toHaveBeenCalledWith({ coins: coinsNumber }, { where: { id: userId } });
      expect(result).toEqual(0);
    });
  });
});
