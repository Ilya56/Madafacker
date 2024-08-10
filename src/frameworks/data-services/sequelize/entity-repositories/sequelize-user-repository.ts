import { Message, User, UserRepositoryAbstract } from '@core';
import { SequelizeGenericRepository } from '../sequelize-generic-repository';
import { IncomeUserMessagesModel, UserModel } from '../models';
import { Sequelize } from 'sequelize-typescript';

declare module 'sequelize' {
  export interface IncrementDecrementOptions {
    returning?: boolean;
  }
}

/**
 * Sequelize user repository implementation
 */
export class SequelizeUserRepository
  extends SequelizeGenericRepository<UserModel, typeof UserModel>
  implements UserRepositoryAbstract
{
  constructor(private readonly sequelize: Sequelize) {
    super(UserModel);
  }

  /**
   * Count users without criteria. Returns a number of all users
   */
  getTotalUsersCount(): Promise<number> {
    return this.repository.count();
  }

  /**
   * Count the quantity of the IncomeUserMessagesModel with messageId
   * @param messageId message to count
   */
  getUsersAlreadySeeMessageCount(messageId: Message['id']): Promise<number> {
    return IncomeUserMessagesModel.count({
      where: { messageId: messageId },
    });
  }

  /**
   * Sort users randomly and takes first quantity of them using limit.
   * Retrieve only id field.
   * Returns a plain array of ids (strings)
   * @param quantity quantity of the random users to retrieve
   */
  async getRandomUserIds(quantity: number): Promise<User['id'][]> {
    const users = await this.repository.findAll({
      order: this.sequelize.random(),
      limit: quantity,
      attributes: ['id'],
    });
    return users.map((user) => user.id);
  }

  /**
   * Creates IncomeUserMessagesModel for each user-message pair
   * @param message message to send
   * @param userIds users to retrieve a message
   */
  async sendMessageToUsers(message: Message, userIds: User['id'][]): Promise<void> {
    const incomeUserMessageData = userIds.map((userId) => ({
      userId,
      messageId: message.id,
    }));
    await IncomeUserMessagesModel.bulkCreate(incomeUserMessageData);
  }

  /**
   * Add some number of coins to the user
   * @param userId user to change coins number
   * @param coinsNumber coins number can be negative if you want to decrease user coins
   */
  async addCoins(userId: User['id'], coinsNumber: number): Promise<number> {
    const [, newCoinsValue] = await this.repository.increment(
      { coins: coinsNumber },
      {
        where: { id: userId },
        returning: true,
      },
    );

    return newCoinsValue ?? 0;
  }
}
