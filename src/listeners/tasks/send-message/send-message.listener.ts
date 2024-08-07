import { Message, TaskServiceAbstract } from '@core';
import { SendMessageUseCase } from '@use-cases/message';
import { Injectable } from '@nestjs/common';
import { TaskListenersAbstract } from '../task-listeners.abstract';

/**
 * Send message listener implementation
 */
@Injectable()
export class SendMessageListener extends TaskListenersAbstract {
  constructor(
    private readonly taskService: TaskServiceAbstract,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {
    super(SendMessageListener.name);
  }

  /**
   * Subscribe on the task service send message queue and process it using send message use case
   * @protected
   */
  protected subscribe(): void {
    this.taskService.sendMessage.processQueue((message) =>
      this.sendMessageUseCase.execute(this.prepareMessage(message)),
    );
  }

  /**
   * Fix a message object after send throw the task service, such transform date fields in date objects
   * @param message message object to fix
   * @private
   */
  private prepareMessage(message: Message): Message {
    message.createdAt = new Date(message.createdAt);
    return message;
  }
}
