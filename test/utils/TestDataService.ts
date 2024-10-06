import { MessageMode } from '@core';
import { UserModel, MessageModel, IncomeUserMessagesModel } from '@frameworks/data-services/sequelize/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Test data service manipulates database data while e2e tests
 */
export class TestDataService {
  /** Stores all created users while test */
  private createdUsers: UserModel[] = [];
  /** Stores all created messages while test */
  private createdMessages: MessageModel[] = [];

  /**
   * Returns mock user name for test, always unique
   */
  getUserName(): string {
    return `user_${uuidv4()}`;
  }

  /**
   * Create a user and store it for later cleanup
   * @param token optional token value
   */
  async createUser(token = 'token'): Promise<UserModel> {
    const user = await UserModel.create({ name: `user_${uuidv4()}`, registrationToken: token });
    this.createdUsers.push(user);
    return user;
  }

  /**
   * Find a user by their ID or name
   * @param query data to search
   */
  async findUser(query: Partial<{ id: string; name: string }>): Promise<UserModel | null> {
    return await UserModel.findOne({ where: query });
  }

  /**
   * Save user to created users to clean up after test
   * @param user
   */
  addCreatedUser(user: UserModel | null) {
    user && this.createdUsers.push(user);
  }

  /**
   * Create a message and store it for later cleanup
   * @param authorId message author id
   * @param body optional message body
   * @param mode optional message mode
   */
  async createMessage(
    authorId: string,
    body = 'Test message',
    mode: MessageMode = MessageMode.dark,
  ): Promise<MessageModel> {
    const message = await MessageModel.create({ body, mode, authorId });
    this.createdMessages.push(message);
    return message;
  }

  /**
   * Cleanup created users
   */
  async cleanupUsers(): Promise<void> {
    for (const user of this.createdUsers) {
      await IncomeUserMessagesModel.destroy({ where: { userId: user.id } });
      await MessageModel.destroy({ where: { authorId: user.id } });
      await UserModel.destroy({ where: { id: user.id } });
    }
    this.createdUsers = [];
  }

  /**
   * Cleanup created messages
   */
  async cleanupMessages(): Promise<void> {
    for (const message of this.createdMessages) {
      await IncomeUserMessagesModel.destroy({ where: { messageId: message.id } });
      await MessageModel.destroy({ where: { id: message.id } });
    }
    this.createdMessages = [];
  }

  /**
   * Cleanup both users and messages
   */
  async cleanupAll(): Promise<void> {
    await this.cleanupMessages();
    await this.cleanupUsers();
  }
}
