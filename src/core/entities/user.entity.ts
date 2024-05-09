import { Message } from './message.entity';
import { Entity } from './entity';

/**
 * Represents model of the system user who uses application, writes messages, etc.
 */
export class User extends Entity {
  /**
   * Now the user has only a name and it should be unique
   */
  name: string;
  /**
   * This is an array of messages that user can see from other users
   */
  incomeMessages: Message[];
  /**
   * This is an array of messages, that were created by the current user
   */
  outcomeMessages: Message[];
}
