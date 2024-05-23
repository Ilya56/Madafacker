import { User, GenericRepositoryAbstract, Message } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a user entity
 */
export interface UserRepositoryAbstract extends GenericRepositoryAbstract<User> {
  /**
   * Returns total active users count
   */
  getTotalUsersCount(): Promise<number>;

  /**
   * Returns a number of users that already see a message with messageId
   * @param messageId message id to check how much users see it
   */
  getUsersAlreadySeeMessageCount(messageId: Message['id']): Promise<number>;

  /**
   * Returns an array of IDs random users. Here should be quantity random users
   * @param quantity quantity of the random users to retrieve
   */
  getRandomUserIds(quantity: number): Promise<User['id'][]>;

  /**
   * Save message as sent to the users that is contained in the userIds
   * @param message message to send users
   * @param userIds user ids array
   */
  sendMessageToUsers(message: Message, userIds: User['id'][]): Promise<void>;
}
