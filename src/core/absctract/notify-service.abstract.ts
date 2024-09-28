/**
 * Notify service allows sending a notification to the user even when a client is closed
 */
export abstract class NotifyServiceAbstract {
  /**
   * Notify user with some message
   * @param token unique user token inside notify system
   * @param message message to send it
   */
  abstract notify(token: string, message: string): Promise<void>;
}
