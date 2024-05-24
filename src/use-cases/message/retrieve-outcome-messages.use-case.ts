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
    const currentUser = await this.userService.getCurrentUser({ withOutcomingMessages: true });
    return currentUser.outcomeMessages;
  }
}
