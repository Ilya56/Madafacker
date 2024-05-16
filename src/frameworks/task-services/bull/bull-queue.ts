import { QueueAbstract } from '@core';
import Bull, { Queue } from 'bull';

/**
 * Bull queue implementation. Can be used with @nestjs/bull for easier integration in the module
 */
export class BullQueue<T> extends QueueAbstract<T> {
  /**
   * Internal bull queue object
   * @private
   */
  private queue: Queue<T>;

  /**
   * Constructor to create a queue with some name
   * @param name queue name
   */
  public constructor(name: string) {
    super();
    this.queue = new Bull<T>(name);
  }

  /**
   * Adds a task with data to the current queue
   * @param data data of the task
   */
  async addTask(data: T): Promise<void> {
    await this.queue.add(data);
  }

  /**
   * Adds a processor to the queue. Don't send any data about job, only data from the task
   * @param processor processor function, should be void
   */
  async processQueue(processor: (data: T) => Promise<void> | void): Promise<void> {
    await this.queue.process((job) => processor(job.data));
  }
}
