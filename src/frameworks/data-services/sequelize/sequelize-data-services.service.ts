import { DataServiceAbstract } from '@core';
import { Injectable } from '@nestjs/common';
import { SequelizeGenericRepository } from './sequelize-generic-repository';
import { MessageModel } from './models';
import { SequelizeUserRepository } from './entity-repositories';
import { SequelizeMessageRepository } from '@frameworks/data-services/sequelize/entity-repositories/sequelize-message-repository';

/**
 * This class stores sequelize data service models to access them from other modules
 */
@Injectable()
export class SequelizeDataServices extends DataServiceAbstract {
  public readonly users: SequelizeUserRepository;
  public readonly messages: SequelizeMessageRepository;
  public readonly replies: SequelizeGenericRepository<MessageModel, typeof MessageModel>;

  constructor() {
    super();
    this.users = new SequelizeUserRepository();
    this.messages = new SequelizeMessageRepository();
    this.replies = new SequelizeGenericRepository<MessageModel, typeof MessageModel>(MessageModel);
  }
}
