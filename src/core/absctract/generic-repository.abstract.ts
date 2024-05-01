/**
 * This is an abstract repository class that defines what child repository should do.
 * It's not defining how it should be done, it can be any type of storage, even in-memory, it's just details.
 * But any storage should do everything defined here
 */
export abstract class GenericRepositoryAbstract<T> {
  /**
   * Returns all rows without any criteria
   */
  abstract getAll(): Promise<T[]>;

  /**
   * Returns specific entity based on the entity id or null if not found
   * @param id
   */
  abstract getById(id: any): Promise<T | null>;

  /**
   * Creates new raw in the storage with new entity and returns it
   * @param entity new entity data
   */
  abstract create(entity: T): Promise<T>;

  /**
   * Removes entity by id
   * @param id entity id to remove
   */
  abstract delete(id: any): Promise<void>;

  /**
   * Updates entity with specified id on the new data and return updated entity
   * @param id of the entity to update
   * @param entity update data
   */
  abstract update(id: any, entity: T): Promise<T>;
}
