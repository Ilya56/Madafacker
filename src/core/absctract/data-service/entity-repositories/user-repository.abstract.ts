import { User, GenericRepositoryAbstract, Message } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a user entity
 */
export interface UserRepositoryAbstract extends GenericRepositoryAbstract<User> {
  /**
   * Returns total users with valid tokens count
   */
  getValidUsersCount(): Promise<number>;

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

  /**
   * Add some number of coins to the user
   * @param userId user to change coins number
   * @param coinsNumber coins number can be negative if you want to decrease user coins
   * @returns new user coins value
   */
  addCoins(userId: User['id'], coinsNumber: number): Promise<number>;

  /**
   * Returns user found by name or null.
   * Name is unique so not more one user can be returned
   * @param name user name to search
   */
  getByName(name: User['name']): Promise<User | null>;

  /**
   * Marks user registration tokens as invalid by setting tokenIsInvalid as true
   * Can accept one or many users id
   * @param ids user ids to mark invalidate token
   */
  markTokensAsInvalid(ids: User['id'] | User['id'][]): Promise<void>;
}
