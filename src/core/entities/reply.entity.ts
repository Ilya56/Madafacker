import { Message } from './message.entity';

/**
 * Reply is the same message, but created as a reply on another message.
 * Reply can be public and visible for all users or private and visible only for message and reply authors.
 */
export class Reply extends Message {
  /**
   * Parent here is a link on the parent message that is replied to
   */
  parent: Message;
  /**
   * Indicate who can see the reply:
   * if true - all users, that can see parent message.
   * if false - only authors of the parent message and reply.
   */
  public: boolean;
}
