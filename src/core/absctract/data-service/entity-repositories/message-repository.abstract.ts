import { GenericRepositoryAbstract, Message, User } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a message entity
 */
export interface MessageRepositoryAbstract extends GenericRepositoryAbstract<Message> {
  /**
   * Returns all income messages for a user with userId
   * @param userId user id to search messages
   */
  getIncomingByUserId(userId: User['id']): Promise<Message[]>;

  /**
   * Returns all outcome message from the user by user id
   * Outcome is a message where author is a user with userId
   * @param userId user id to search messages
   */
  getOutcomingByUserId(userId: User['id']): Promise<Message[]>;
}
