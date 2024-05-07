import { GenericRepositoryAbstract } from '@core';
import { Model, ModelCtor } from 'sequelize-typescript';
import { CreationAttributes } from 'sequelize';

/**
 * Generic repository for all models. You can extend it to add new methods if you need
 */
export class SequelizeGenericRepository<T extends Model<any, any>, R extends ModelCtor<T>>
  implements GenericRepositoryAbstract<T>
{
  protected repository: R;

  /**
   * Creates new instance of the repository
   * @param repository Sequelize model to work with
   */
  public constructor(repository: R) {
    this.repository = repository;
  }

  /**
   * All methods here is just an implementation of the GenericRepositoryAbstract, please check docs of this class
   */
  getAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  getById(id: any): Promise<T | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  create(entity: T): Promise<T> {
    return this.repository.create(entity as CreationAttributes<T>);
  }

  async delete(id: any): Promise<void> {
    await this.repository.destroy({
      where: { id },
    });
  }

  async update(id: any, entity: T): Promise<T> {
    const [, updatedRows] = await this.repository.update(entity, {
      where: { id },
      returning: true,
    });
    return updatedRows[0];
  }
}
