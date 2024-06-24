import { GenericRepositoryAbstract, Message, User } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a message entity
 */
export interface MessageRepositoryAbstract extends GenericRepositoryAbstract<Message> {
  /**
   * Returns all income messages for a user with userId.
   * If replies depth > 0 returns replies of the message with specified depth
   * @param userId user id to search messages
   * @param [repliesDepth] replies depth.
   * 1 - means that only message replies should be returned.
   * 2 - replies on the replies on the message will be returned too and so on.
   * By default, it should be 0.
   */
  getIncomingByUserId(userId: User['id'], repliesDepth?: number): Promise<Message[]>;

  /**
   * Returns all outcome message from the user by user id
   * Outcome is a message where author is a user with userId
   * If replies depth > 0 returns replies of the message with specified depth
   * @param userId user id to search messages
   * @param [repliesDepth] replies depth.
   * 1 - means that only message replies should be returned.
   * 2 - replies on the replies on the message will be returned too and so on.
   * By default, it should be 0.
   */
  getOutcomingByUserId(userId: User['id'], repliesDepth?: number): Promise<Message[]>;

  /**
   * Returns all messages that are in the sending process
   */
  getNotSentMessages(): Promise<Message[]>;
}
