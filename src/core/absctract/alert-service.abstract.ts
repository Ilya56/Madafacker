/**
 * This service is created to alert developers about issues
 * Use it to handle exceptions and react on them quickly
 */
export abstract class AlertServiceAbstract {
  /**
   * Process exception in the system and notify developers about it
   * @param exception exception to notify about
   */
  public abstract processException(exception: any): Promise<void>;
}
