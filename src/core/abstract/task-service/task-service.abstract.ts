import { QueueAbstract } from './queue.abstract';
import { Message } from '@core';

/**
 * Tasks class. It contains queues that are used by the system
 * Queue here is a core property because it's related to the business
 */
export abstract class TaskServiceAbstract {
  /**
   * Send message queue. A message should be added to the queue after creation.
   * Handler should send a message to users using some algo.
   */
  public abstract sendMessage: QueueAbstract<Message>;
}
