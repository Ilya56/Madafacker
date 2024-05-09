import { CommandAbstract } from '@use-cases/abstract';
import { Message } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateMessageUseCase extends CommandAbstract<Message, Message> {
  /**
   * Creates a new message for the current user
   * @param message message object to create without an author
   */
  protected async implementation(message: Message): Promise<Message> {
    message.author = await this.userService.getCurrentUser();
    return this.dataService.messages.create(message);
    // TODO: implement algo of message sending
  }
}
