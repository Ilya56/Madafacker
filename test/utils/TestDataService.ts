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
   * @param coins optional coins number
   */
  async createUser(token = 'token', coins = 0): Promise<UserModel> {
    const user = await UserModel.create({ name: `user_${uuidv4()}`, registrationToken: token, coins });
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
   * Get all created users
   */
  getFirstCreatedUser(): UserModel {
    return this.createdUsers[0];
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
   * Get the total number of users
   */
  async getUsersCount(): Promise<number> {
    return await UserModel.count();
  }

  /**
   * Get all existing users
   */
  async getAllUsers(): Promise<UserModel[]> {
    return await UserModel.findAll();
  }

  /**
   * Retrieve users with invalid tokens
   */
  async getUsersWithInvalidTokens(): Promise<UserModel[]> {
    return await UserModel.findAll({ where: { tokenIsInvalid: true } });
  }

  /**
   * Create a message and store it for later cleanup
   * @param messageData message data
   */
  async createMessage(
    messageData: Partial<Omit<MessageModel, 'authorId'>> & Pick<MessageModel, 'authorId'>,
  ): Promise<MessageModel> {
    const filledMessageData = Object.assign(
      {
        body: 'Test message',
        mode: MessageMode.dark,
      },
      messageData,
    );
    const message = await MessageModel.create(filledMessageData);
    this.createdMessages.push(message);
    return message;
  }

  /**
   * Find all income messages for a specific messageId
   */
  async findIncomeMessages(messageId: string): Promise<IncomeUserMessagesModel[]> {
    return await IncomeUserMessagesModel.findAll({ where: { messageId } });
  }

  /**
   * Bulk create income messages for users
   */
  async bulkCreateIncomeMessages(users: UserModel[], messageId: string): Promise<void> {
    const incomeMessagesData = users.map((user) => ({ userId: user.id, messageId }));
    await IncomeUserMessagesModel.bulkCreate(incomeMessagesData);
  }

  /**
   * Get the first created message
   */
  getFirstCreatedMessage(): MessageModel {
    return this.createdMessages[0];
  }

  /**
   * Find a message by query (id, body, etc.)
   * @param query
   */
  async findMessage(query: Partial<{ id: string; body: string }>): Promise<MessageModel | null> {
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
   * Get a non-existent ID (simulates a random UUID for testing purposes)
   */
  getNonExistentId(): string {
    return uuidv4(); // Generates a random UUID to simulate non-existent entity
  }

  /**
   * Update the number of coins for a specific user
   * @param userId user id to update coins
   * @param coins new counts count
   */
  async updateUserCoins(userId: string, coins: number): Promise<void> {
    await UserModel.update({ coins }, { where: { id: userId } });
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
   * Returns income user message model
   * @param messageId message to retrieve where was send
   */
  getInboxMessageById(messageId: string) {
    return IncomeUserMessagesModel.findOne({ where: { messageId: messageId } });
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
