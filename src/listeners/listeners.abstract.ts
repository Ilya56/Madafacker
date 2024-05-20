import { Logger, OnApplicationBootstrap } from '@nestjs/common';

/**
 * Listener abstract class
 * Each listener should subscribe on the events in the method subscribe
 */
export abstract class ListenersAbstract implements OnApplicationBootstrap {
  /**
   * Listeners logger
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
   * Each listener is initialized in the start of the application
   * This method calls abstract subscribe method and catch errors from it
   * Is used by the Nest.js, don't override this method
   */
  public onApplicationBootstrap(): any {
    Promise.resolve(this.subscribe()).catch((err) => this.logger.error(err));
  }

  /**
   * This method should subscribe listener on the event and bind it with a processor/callback
   * @protected
   */
  protected abstract subscribe(): Promise<void> | void;
}
