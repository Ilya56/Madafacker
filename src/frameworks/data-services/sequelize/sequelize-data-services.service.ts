import { DataServiceAbstract } from '../../../core';
import { Injectable } from '@nestjs/common';
import { SequelizeGenericRepository } from './sequelize-generic-repository';
import { UserModel } from './models';
import { MessageModel } from './models';

/**
 * This class stores sequelize data service models to access them from other modules
 */
@Injectable()
export class SequelizeDataServices extends DataServiceAbstract {
  public readonly users: SequelizeGenericRepository<UserModel, typeof UserModel>;
  public readonly messages: SequelizeGenericRepository<MessageModel, typeof MessageModel>;
  public readonly replies: SequelizeGenericRepository<MessageModel, typeof MessageModel>;

  constructor() {
    super();
    this.users = new SequelizeGenericRepository<UserModel, typeof UserModel>(UserModel);
    this.messages = new SequelizeGenericRepository<MessageModel, typeof MessageModel>(MessageModel);
    this.replies = new SequelizeGenericRepository<MessageModel, typeof MessageModel>(MessageModel);
  }
}
