import { Message, TaskServiceAbstract } from '@core';
import { BullQueue } from './bull-queue';

/**
 * Implementation of the task service using bull lib
 */
export class BullTaskServices extends TaskServiceAbstract {
  /**
   * System queues list
   */
  public sendMessage: BullQueue<Message>;

  /**
   * Constructor to init queues
   */
  constructor() {
    super();
    this.sendMessage = new BullQueue<Message>('sendMessage');
  }
}
