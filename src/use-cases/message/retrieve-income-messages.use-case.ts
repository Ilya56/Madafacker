import { QueryAbstract } from '@use-cases/abstract';
import { Message } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RetrieveIncomeMessagesUseCase extends QueryAbstract<void, Message[]> {
  /**
   * Returns all incoming messages for a user
   * @protected
   */
  protected async implementation(): Promise<Message[]> {
    const currentUser = await this.userService.getCurrentUser({
      withIncomingMessages: true,
    });

    const messages = currentUser.incomeMessages;
    if (!messages || messages.length === 0) {
      return [];
    }

    const messageIds = messages.map((message) => message.id);

    const [stats, ownRatings] = await Promise.all([
      this.dataService.incomeUserMessage.getRatingStatsByMessageIds(messageIds),
      this.dataService.incomeUserMessage.getUserRatingsByMessageIds(currentUser.id, messageIds),
    ]);

    messages.forEach((message) => {
      message.ratingStats = stats[message.id];
      message.ownRating = ownRatings[message.id];
    });

    return messages;
  }
}
