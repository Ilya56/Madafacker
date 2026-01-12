import { QueryAbstract } from '@use-cases/abstract';
import { Message } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RetrieveOutcomeMessagesUseCase extends QueryAbstract<void, Message[]> {
  /**
   * Returns all incoming messages for a user
   * @protected
   */
  protected async implementation(): Promise<Message[]> {
    const currentUser = await this.userService.getCurrentUser({
      withOutcomingMessages: true,
    });

    const messages = currentUser.outcomeMessages;
    if (!messages || messages.length === 0) {
      return [];
    }

    const messageIds = messages.map((message) => message.id);
    const stats = await this.dataService.incomeUserMessage.getRatingStatsByMessageIds(messageIds);

    messages.forEach((message) => {
      message.ratingStats = stats[message.id];
    });

    return messages;
  }
}
