import { User, UserRepositoryAbstract } from '@core';
import { SequelizeGenericRepository } from '@frameworks/data-services/sequelize/sequelize-generic-repository';
import { UserModel } from '@frameworks/data-services/sequelize/models';
import { Injectable } from '@nestjs/common';

/**
 * Sequelize user repository implementation
 */
@Injectable()
export class SequelizeUserRepository
  extends SequelizeGenericRepository<UserModel, typeof UserModel>
  implements UserRepositoryAbstract
{
  async updateByName(name: string, user: User): Promise<User> {
    const [, updatedRows] = await this.repository.update(user, {
      where: { name },
      returning: true,
    });
    return updatedRows[0];
  }
}
