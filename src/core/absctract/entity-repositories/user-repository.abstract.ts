import { User, GenericRepositoryAbstract, Message } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a user entity
 */
export interface UserRepositoryAbstract extends GenericRepositoryAbstract<User> {
  /**
   * Updates user with specified name on the new data and return updated user or null if no user to update
   * @param name name of the user to update
   * @param user new user data
   */
  updateByName(name: string, user: User): Promise<User>;

  /**
   * Returns total active users count
   */
  getTotalUsersCount(): Promise<number>;

  /**
   * Returns a number of users that already see a message with messageId
   * @param messageId message id to check how much users see it
   */
  getUsersAlreadySeeMessageCount(messageId: string): Promise<number>;

  /**
   * Returns an array of IDs random users. Here should be quantity random users
   * @param quantity quantity of the random users to retrieve
   */
  getRandomUserIds(quantity: number): Promise<string[]>;

  /**
   * Save message as sent to the users that is contained in the userIds
   * @param message message to send users
   * @param userIds user ids array
   */
  sendMessageToUsers(message: Message, userIds: string[]): Promise<void>;
}
