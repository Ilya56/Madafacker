import { CommandAbstract } from '@use-cases/abstract';
import { Message } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateMessageUseCase extends CommandAbstract<Message, Message> {
  /**
   * Creates a new message for the current user and send it to the users
   * @param message message object to create without an author
   */
  protected async implementation(message: Message): Promise<Message> {
    message.author = await this.userService.getCurrentUser();
    const createdMessage = await this.dataService.messages.create(message);

    await this.taskService.sendMessage.addTask(createdMessage);

    return createdMessage;
  }
}
