import { User, UserRepositoryAbstract } from '@core';
import { UserModel, SequelizeGenericRepository } from '@frameworks/data-services/sequelize';
import { Injectable } from '@nestjs/common';

/**
 * Sequelize user repository implementation
 */
@Injectable()
export class SequelizeUserRepository
  extends SequelizeGenericRepository<UserModel, typeof UserModel>
  implements UserRepositoryAbstract
{
  constructor() {
    super(UserModel);
  }

  async updateByName(name: string, user: User): Promise<User> {
    const [, updatedRows] = await this.repository.update(user, {
      where: { name },
      returning: true,
    });
    return updatedRows[0];
  }
}
