import { Message, User, UserRepositoryAbstract } from '@core';
import { UserModel, SequelizeGenericRepository, IncomeUserMessagesModel } from '@frameworks/data-services/sequelize';
import { Sequelize } from 'sequelize-typescript';

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

  async updateByName(name: string, user: User): Promise<User> {
    const [, updatedRows] = await this.repository.update(user, {
      where: { name },
      returning: true,
    });
    return updatedRows[0];
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
  getUsersAlreadySeeMessageCount(messageId: string): Promise<number> {
    return IncomeUserMessagesModel.count({
      where: { messageId: messageId },
    });
  }

  /**
   * Sort users in a random way and takes first quantity of them using limit.
   * Retrieve only id field.
   * Returns a plain array of ids (strings)
   * @param quantity quantity of the random users to retrieve
   */
  async getRandomUserIds(quantity: number): Promise<string[]> {
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
  async sendMessageToUsers(message: Message, userIds: string[]): Promise<void> {
    const incomeUserMessageData = userIds.map((userId) => ({
      userId,
      messageId: message.id,
    }));
    await IncomeUserMessagesModel.bulkCreate(incomeUserMessageData);
  }
}
