import { Message, TaskServiceAbstract, User, ConvertObjectsToStringType, MessageMode } from '@core';
import { SendMessageUseCase } from '@use-cases/message';
import { Injectable } from '@nestjs/common';
import { TaskListenersAbstract } from '../task-listeners.abstract';
import * as Sentry from '@sentry/nestjs';

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
    Sentry.captureException(new Error('TEST'));
  }

  /**
   * Fix a message object after send throw the task service, such transform date fields in date objects
   * @param rawMessage message object to fix
   * @private
   */
  private prepareMessage(rawMessage: ConvertObjectsToStringType<Message>): Message {
    const message = new Message();
    message.id = rawMessage.id;
    message.body = rawMessage.body;
    message.wasSent = rawMessage.wasSent;

    message.mode = rawMessage.mode as MessageMode;
    message.createdAt = new Date(rawMessage.createdAt);

    if (rawMessage.author) {
      const author = new User();
      author.id = rawMessage.author.id;
      author.name = rawMessage.author.name;
      author.outcomeMessages = rawMessage.author.outcomeMessages?.map((m) => this.prepareMessage(m));
      author.incomeMessages = rawMessage.author.incomeMessages?.map((m) => this.prepareMessage(m));
      message.author = author;
    }

    return message;
  }
}
