import { MessageMode } from '../enums';
import { User } from './user.entity';
import { Entity } from './entity';

/**
 * Message is a message from any user with any text that will be shown to another user's.
 * Message knows who creates it.
 * Message mode indicates a type of the message to separate different types from each other.
 */
export class Message extends Entity {
  /**
   * This is message text, main field
   */
  body: string;
  /**
   * Message author is a link on the User who creates this message
   */
  author: User;
  /**
   * Message mode is created to separate messages from different application modes (like Good and Evil)
   */
  mode: MessageMode;
  /**
   * Message creation date JS object
   */
  createdAt: Date;
  /**
   * Mark that message already was sent to all users and no need to process this message again
   */
  wasSent: boolean;
}
