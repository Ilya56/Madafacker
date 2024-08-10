import { GenericRepositoryAbstract, Message, User } from '@core';

/**
 * getById method options
 */
export type GetByIdOptions = {
  /**
   * If true - should return a message with an author object
   */
  withAuthor?: boolean;
};

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

  /**
   * Mark the message as sent. By the fact make wasSent = true
   * @param messageId message id to mark as sent
   */
  markAsSent(messageId: Message['id']): Promise<void>;

  /**
   * Returns message by id with additional options
   * @param id message id to retrieve
   * @param options please check type to get more info
   */
  getById(id: Message['id'], options?: GetByIdOptions): Promise<Message | null>;
}
