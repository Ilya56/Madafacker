import { ConvertObjectsToStringType, QueueAbstract } from '@core';
import Bull, { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '@config';

/**
 * Bull queue implementation.
 */
export class BullQueue<T> extends QueueAbstract<T> {
  /**
   * Internal bull queue object
   * @private
   */
  private queue: Queue<T>;

  /**
   * Constructor to create a queue with some name
   * @param configService config service to retrieve redis config
   * @param name queue name
   */
  public constructor(configService: ConfigService, name: string) {
    super();
    this.queue = new Bull<T>(name, { redis: configService.get<ConfigType['redis']>('redis') });
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
  async processQueue(processor: (data: ConvertObjectsToStringType<T>) => Promise<void> | void): Promise<void> {
    await this.queue.process((job) => processor(job.data as ConvertObjectsToStringType<T>));
  }

  /**
   * Close the queue. Is used to stop listener when application is stooped
   */
  close() {
    return this.queue.close();
  }
}
