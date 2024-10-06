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
   * Create multiple users
   * @param count number of new users
   * @param token token prefix
   */
  async createMultipleUsers(count: number, token = 'token'): Promise<void> {
    for (let i = 0; i < count; i++) {
      const user = await this.createUser(`${token}-${i}`);
      this.createdUsers.push(user);
    }
  }

  /**
   * Find a user by their ID or name
   * @param query data to search
   */
  async findUser(query: Partial<{ id: string; name: string }>): Promise<UserModel | null> {
    return await UserModel.findOne({ where: query });
  }

  /**
   * Save user to created users array to clean up after test
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
   * @param parentId optional parent message id
   */
  async createMessage(
    authorId: string,
    body = 'Test message',
    mode: MessageMode = MessageMode.dark,
    parentId?: string,
  ): Promise<MessageModel> {
    const message = await MessageModel.create({ body, mode, authorId, parentId });
    this.createdMessages.push(message);
    return message;
  }

  /**
   * Find a message by query (id, body, etc.)
   * @param query
   */
  async findMessage(query: Partial<{ id: number; body: string }>): Promise<MessageModel | null> {
    return await MessageModel.findOne({ where: query });
  }

  /**
   * Add a created message to the list for cleanup later
   * @param message
   */
  addCreatedMessage(message: MessageModel | null): void {
    message && this.createdMessages.push(message);
  }

  /**
   * Add a message to a user's inbox (creates IncomeUserMessagesModel)
   * @param userId
   * @param messageId
   */
  async addMessageToUserInbox(userId: string, messageId: string): Promise<void> {
    await IncomeUserMessagesModel.create({
      userId,
      messageId,
    });
  }

  /**
   * Get all created users
   */
  getFirstCreatedUser(): UserModel {
    return this.createdUsers[0];
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
    for (const message of this.createdMessages.reverse()) {
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
