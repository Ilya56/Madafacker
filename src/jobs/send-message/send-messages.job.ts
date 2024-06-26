import { JobsAbstract } from '../jobs.abstract';
import { Injectable } from '@nestjs/common';
import { DataServiceAbstract, TaskServiceAbstract } from '@core';

/**
 * Send messages every day (or another time) job
 */
@Injectable()
export class SendMessagesJob extends JobsAbstract {
  constructor(private readonly dataService: DataServiceAbstract, private readonly taskService: TaskServiceAbstract) {
    super(SendMessagesJob.name);
  }

  /**
   * Retrieves all messages that should be sent and creates tasks for each of them
   * @protected
   */
  protected async implementation(): Promise<void> {
    const messagesToSend = await this.dataService.messages.getNotSentMessages();

    for (const message of messagesToSend) {
      await this.taskService.sendMessage.addTask(message);
    }
  }
}
