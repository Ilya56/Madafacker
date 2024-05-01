import { GenericRepositoryAbstract } from '../../../core';
import { Model, ModelCtor } from 'sequelize-typescript';
import { CreationAttributes } from 'sequelize';

export class SequelizeGenericRepository<
  T extends Model<any, any>,
  R extends ModelCtor<T>,
> extends GenericRepositoryAbstract<T> {
  private repository: R;

  public constructor(repository: R) {
    super();
    this.repository = repository;
  }

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
