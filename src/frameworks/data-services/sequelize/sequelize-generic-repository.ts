import { DuplicateNotAllowedError, GenericRepositoryAbstract } from '@core';
import { Model, ModelCtor } from 'sequelize-typescript';
import { CreationAttributes } from 'sequelize';

/**
 * Generic repository for all models. You can extend it to add new methods if you need
 */
export class SequelizeGenericRepository<T extends Model<any, any>, R extends ModelCtor<T>>
  implements GenericRepositoryAbstract<T>
{
  /**
   * Sequelize model
   * @protected
   */
  protected repository: R;

  /**
   * Creates new instance of the repository
   * @param repository Sequelize model to work with
   */
  public constructor(repository: R) {
    this.repository = repository;
  }

  /**
   * Returns all records by using find all methods
   */
  getAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  /**
   * Returns model instance using find one method with id as an only criteria.
   * @param id instance id to search
   */
  getById(id: any): Promise<T | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Creates new instance of the model based on the provided entity
   * Uses standard model static create method
   * @param entity new instance data
   */
  async create(entity: T): Promise<T> {
    try {
      return await this.repository.create(entity as CreationAttributes<T>);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new DuplicateNotAllowedError(error?.original?.detail || error?.message || error);
      }
      throw error;
    }
  }

  /**
   * It uses destroy method with id as a criteria
   * @param id instance id to destroy
   */
  async delete(id: any): Promise<void> {
    await this.repository.destroy({
      where: { id },
    });
  }

  /**
   * Search for instances based on the id and updates them based on the provided entity object.
   * If no object was updated - return null
   * @param id instance id to update
   * @param entity data to update
   */
  async update(id: any, entity: Partial<T>): Promise<T | null> {
    const [, updatedRows] = await this.repository.update(entity, {
      where: { id },
      returning: true,
    });
    return updatedRows?.[0] ?? null;
  }
}
