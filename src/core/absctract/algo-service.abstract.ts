import { Message } from '../entities';

/**
 * Also output. If the value in this object exists - you should do what this value means.
 * - usersCount - this means to send a message to this number of random users
 */
export type ShowMessageOutput = {
  usersCount?: number;
};

/**
 * Abstract algo interface to implement. You should use the implementation of this algo to send messages to the users.
 */
export abstract class AlgoServiceAbstract {
  /**
   * Returns criteria to detect users who should see this message after function call
   * It can retrieve a message object and should return an object with criteria to find users to show message
   * @param message message that should be processed
   */
  public abstract selectUsersShowMessage(message: Message): Promise<ShowMessageOutput>;
}
