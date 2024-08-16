import { CommandAbstract } from '@use-cases/abstract';
import { Message, NotFoundError, OperationNotAllowedException } from '@core';
import { Injectable } from '@nestjs/common';
import { MessageRating } from '@core';

type RateMessageInput = {
  messageId: Message['id'];
  rating: MessageRating;
};

/**
 * Map how many coins user receive for each possible rating option
 */
const RATING_TO_COINS = {
  [MessageRating.dislike]: 0,
  [MessageRating.like]: 1,
  [MessageRating.superlike]: 2,
} as const;

@Injectable()
export class RateMessageUseCase extends CommandAbstract<RateMessageInput, void> {
  /**
   * Rate message from another user.
   * Message can be rated only once.
   * Users cannot rate their own message.
   * If a message does not exist, it throws an exception.
   * Users cannot rate a message not received previously.
   * After a message rated, it adds coins to the message author
   * @param messageId message id to rate
   * @param rating user rating
   */
  protected async implementation({ messageId, rating }: RateMessageInput): Promise<void> {
    const user = await this.userService.getCurrentUser({ withOutcomingMessages: true });

    const userMessageIds = user.outcomeMessages.map((message) => message.id);

    if (userMessageIds.includes(messageId)) {
      throw new OperationNotAllowedException('Cannot rate own message');
    }

    const messageRating = await this.dataService.incomeUserMessage.getUserMessageRating(user.id, messageId);

    if (messageRating) {
      throw new OperationNotAllowedException('Rating can only be set once and cannot be changed');
    }

    const message = await this.dataService.messages.getById(messageId, { withAuthor: true });

    if (!message) {
      throw new NotFoundError(`Message with id ${messageId} was not found`);
    }

    const rated = await this.dataService.incomeUserMessage.rateMessage(user.id, messageId, rating);

    if (!rated) {
      throw new NotFoundError(`Cannot rate because message with id ${messageId} not found for current user ${user.id}`);
    }

    const coinsToAdd = RATING_TO_COINS[rating];

    if (coinsToAdd > 0) {
      await this.dataService.users.addCoins(message.author.id, coinsToAdd);
    }
  }
}
