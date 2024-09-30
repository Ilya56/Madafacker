import { CoreError } from './CoreError';

/**
 * Throw this exception when notify service token is invalid
 */
export class InvalidNotifyServiceTokenException extends CoreError {
  /**
   * Notify service token string
   */
  public readonly token: string;

  /**
   * Creates a new exception with token that raises issue
   * @param message error message
   * @param token notify service token
   */
  constructor(message: string, token: string) {
    super(message);
    this.token = token;
  }
}
