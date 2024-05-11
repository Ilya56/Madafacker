/**
 * Core error base class
 */
export class CoreError extends Error {
  /**
   * Error constructor takes a message of the error only
   * @param message error message
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
