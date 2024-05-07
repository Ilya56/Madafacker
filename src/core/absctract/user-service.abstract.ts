import { User } from '../entities';

/**
 * User service respond on the user operations that are externally implemented
 */
export abstract class UserServiceAbstract {
  /**
   * Returns current user. Current is a user that makes a request. For example, based on the JWT token
   */
  public abstract getCurrentUser(): Promise<User>;
}
