/**
 * This is an abstract repository class that defines what child repository should do.
 * It's not defining how it should be done, it can be any type of storage, even in-memory, it's just details.
 * But any storage should do everything defined here
 */
export interface GenericRepositoryAbstract<T> {
  /**
   * Returns all rows without any criteria
   */
  getAll(): Promise<T[]>;

  /**
   * Returns specific entity based on the entity id or null if not found
   * @param id
   */
  getById(id: any): Promise<T | null>;

  /**
   * Creates new raw in the storage with new entity and returns it
   * @param entity new entity data
   */
  create(entity: T): Promise<T>;

  /**
   * Removes entity by id
   * @param id entity id to remove
   */
  delete(id: any): Promise<void>;

  /**
   * Updates entity with specified id on the new data and return updated entity or null if no entity to update
   * @param id of the entity to update
   * @param entity update data
   */
  update(id: any, entity: T): Promise<T | null>;
}
