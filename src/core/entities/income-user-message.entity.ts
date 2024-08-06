import { Message, MessageRating, User } from '@core';

/**
 * This model connects income message and user. It saves all data related to the user-message pair
 */
export class IncomeUserMessage {
  /**
   * User that receiver a message
   */
  user: User;
  /**
   * A message that user received
   */
  message: Message;
  /**
   * User rating on the message
   */
  rating?: MessageRating;
}
