import { DataServiceAbstract } from '@core';
import { Injectable } from '@nestjs/common';
import { SequelizeGenericRepository } from './sequelize-generic-repository';
import { UserModel } from './models';
import { MessageModel } from './models';
import { SequelizeUserRepository } from './entity-repositories';

/**
 * This class stores sequelize data service models to access them from other modules
 */
@Injectable()
export class SequelizeDataServices extends DataServiceAbstract {
  public readonly users: SequelizeUserRepository;
  public readonly messages: SequelizeGenericRepository<MessageModel, typeof MessageModel>;
  public readonly replies: SequelizeGenericRepository<MessageModel, typeof MessageModel>;

  constructor() {
    super();
    this.users = new SequelizeUserRepository(UserModel);
    this.messages = new SequelizeGenericRepository<MessageModel, typeof MessageModel>(MessageModel);
    this.replies = new SequelizeGenericRepository<MessageModel, typeof MessageModel>(MessageModel);
  }
}
