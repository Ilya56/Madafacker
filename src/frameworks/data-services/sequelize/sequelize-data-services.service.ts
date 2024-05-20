import { DataServiceAbstract } from '@core';
import { Injectable, Logger } from '@nestjs/common';
import { SequelizeGenericRepository } from './sequelize-generic-repository';
import { MessageModel } from './models';
import { SequelizeUserRepository } from './entity-repositories';
import { SequelizeMessageRepository } from './entity-repositories/sequelize-message-repository';
import { Transactional } from 'sequelize-transactional-decorator';
import { Sequelize } from 'sequelize-typescript';

/**
 * This class stores sequelize data service models to access them from other modules
 */
@Injectable()
export class SequelizeDataServices extends DataServiceAbstract {
  public readonly users: SequelizeUserRepository;
  public readonly messages: SequelizeMessageRepository;
  public readonly replies: SequelizeGenericRepository<MessageModel, typeof MessageModel>;

  private readonly logger = new Logger(SequelizeDataServices.name);

  constructor(sequelize: Sequelize) {
    super();
    this.users = new SequelizeUserRepository(sequelize);
    this.messages = new SequelizeMessageRepository();
    this.replies = new SequelizeGenericRepository<MessageModel, typeof MessageModel>(MessageModel);
  }

  @Transactional()
  async transactional<I, O>(func: (...args: I[]) => O): Promise<O> {
    try {
      return func();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
