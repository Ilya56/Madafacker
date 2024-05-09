/**
 * Resource didn't find error class
 */
export class NotFoundError extends Error {
  /**
   * Error constructor takes a message of the error only
   * @param message error message
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
