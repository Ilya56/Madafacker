import { TaskServiceAbstract } from '@core';
import { SendMessageUseCase } from '@use-cases/message';
import { Injectable } from '@nestjs/common';
import { ListenersAbstract } from '../listeners.abstract';

/**
 * Send message listener implementation
 */
@Injectable()
export class SendMessageListener extends ListenersAbstract {
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
    this.taskService.sendMessage.processQueue((message) => this.sendMessageUseCase.execute(message));
  }
}
