import { Logger } from '@nestjs/common';

/**
 * Job abstract class. It provides how to run and how to implement a job
 */
export abstract class JobsAbstract {
  /**
   * Jobs logger
   * @protected
   */
  protected logger: Logger;

  /**
   * Creates logger with given class name
   * @param name class name to show in logs
   * @protected
   */
  protected constructor(name: string) {
    this.logger = new Logger(name);
  }

  /**
   * Should be executed to run a job
   */
  public execute() {
    return this.implementation();
  }

  /**
   * This method should be implemented by the job implementation
   * @protected
   */
  protected abstract implementation(): Promise<void> | void;
}
