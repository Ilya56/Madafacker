import { CommandAbstract } from '@use-cases/abstract';
import { Message, NotFoundError, OperationNotAllowedException } from '@core';
import { Injectable } from '@nestjs/common';
import { MessageRating } from '@core';

type RateMessageInput = {
  messageId: Message['id'];
  rating: MessageRating;
};

@Injectable()
export class RateMessageUseCase extends CommandAbstract<RateMessageInput, void> {
  /**
   * Rate message from another user.
   * Message can be rate only once
   * User cannot rate their own message
   * If a message not exists - it throws an exception
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

    const rated = await this.dataService.incomeUserMessage.rateMessage(user.id, messageId, rating);

    if (!rated) {
      throw new NotFoundError(`Cannot rate because message with id ${messageId} not found for current user ${user.id}`);
    }
  }
}
