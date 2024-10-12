import { Message, User, UserRepositoryAbstract } from '@core';
import { SequelizeGenericRepository } from '../sequelize-generic-repository';
import { IncomeUserMessagesModel, UserModel } from '../models';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

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
  getValidUsersCount(): Promise<number> {
    return this.repository.count({ where: { tokenIsInvalid: false } });
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

  /**
   * Search user using findOne and return it
   * @param name user name to search
   */
  getByName(name: User['name']): Promise<User | null> {
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }

  /**
   * Updates user or users tokenIsInvalid to `true`
   * @param ids user ids to update
   */
  async markTokensAsInvalid(ids: User['id'] | User['id'][]): Promise<void> {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    await this.repository.update(
      { tokenIsInvalid: true },
      {
        where: { id: { [Op.in]: ids } },
      },
    );
  }

  /**
   * Updates user entity
   * If user updates registration token, need to mark it as valid
   * @param id user id to update
   * @param user user data to update
   */
  update(id: User['id'], user: Partial<UserModel>): Promise<UserModel | null> {
    if (user.registrationToken) {
      user.tokenIsInvalid = false;
    }
    return super.update(id, user);
  }
}
