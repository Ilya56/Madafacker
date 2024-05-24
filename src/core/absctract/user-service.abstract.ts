import { User } from '../entities';

/**
 * getCurrentUser method options
 */
export type GetUserOptions = {
  /**
   * If true - should return user entity with a populated array of the incoming messages
   */
  withIncomingMessages?: boolean;
  /**
   * If true - should return user entity with a populated array of the outcoming messages
   */
  withOutcomingMessages?: boolean;
};

/**
 * User service respond on the user operations that are externally implemented
 */
export abstract class UserServiceAbstract {
  /**
   * Returns current user. Current is a user that makes a request. For example, based on the JWT token
   * If no used - throw NotFoundError exception
   */
  public abstract getCurrentUser(options?: GetUserOptions): Promise<User>;
}
