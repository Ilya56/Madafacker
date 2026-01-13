import { ConvertObjectsToStringType } from './convert-objects-to-string.type';

/**
 * Task queue class. Can process queue and add a task to the queue
 * Generic is a type of the event data. T is sent to the queue and retrieved by the processor
 */
export abstract class QueueAbstract<T> {
  /**
   * Process queue with some handler
   * @param processor processor function. Retrieve only one argument - task data
   */
  public abstract processQueue(
    processor: (data: ConvertObjectsToStringType<T>) => Promise<void> | void,
  ): Promise<void> | void;

  /**
   * Adds a new task to the current queue
   * @param data task data to process
   */
  public abstract addTask(data: T): Promise<void> | void;
}
