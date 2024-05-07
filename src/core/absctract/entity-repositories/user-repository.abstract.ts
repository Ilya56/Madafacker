import { User, GenericRepositoryAbstract } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a user entity
 */
export interface UserRepositoryAbstract extends GenericRepositoryAbstract<User> {
  /**
   * Updates user with specified name on the new data and return updated user or null if no user to update
   * @param name name of the user to update
   * @param user new user data
   */
  updateByName(name: string, user: User): Promise<User>;
}
