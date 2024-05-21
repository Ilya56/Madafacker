import { GenericRepositoryAbstract, Message } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a message entity
 */
export interface MessageRepositoryAbstract extends GenericRepositoryAbstract<Message> {
  /**
   * Returns all income messages for a user with userId
   * @param userId user id to search messages
   */
  getIncomingByUserId(userId: string): Promise<Message[]>;
}
