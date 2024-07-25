import { DataServiceAbstract } from '@core';
import { Injectable, Logger } from '@nestjs/common';
import { SequelizeUserRepository, SequelizeMessageRepository, SequelizeReplyRepository } from './entity-repositories';
import { Transactional } from 'sequelize-transactional-decorator';
import { Sequelize } from 'sequelize-typescript';
import { DatabaseError } from 'sequelize';

/**
 * This class stores sequelize data service models to access them from other modules
 */
@Injectable()
export class SequelizeDataServices extends DataServiceAbstract {
  /**
   * Repositories type overriding
   */
  public readonly users: SequelizeUserRepository;
  public readonly messages: SequelizeMessageRepository;
  public readonly replies: SequelizeReplyRepository;

  /**
   * Service logger
   * @private
   */
  private readonly logger = new Logger(SequelizeDataServices.name);

  /**
   * Creates new service instance. Requires sequelize as a parameter to create repositories
   * @param sequelize sequelize instance
   */
  constructor(sequelize: Sequelize) {
    super();
    this.users = new SequelizeUserRepository(sequelize);
    this.messages = new SequelizeMessageRepository();
    this.replies = new SequelizeReplyRepository();
  }

  /**
   * It uses sequelize-transactional-decorator lib to decorate method with a transaction.
   * Transaction is scoped, no need to add a transaction option in each request
   * @param func function to run in transaction
   */
  @Transactional()
  async transactional<I, O>(func: (...args: I[]) => O): Promise<O> {
    try {
      return await func();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  /**
   * Checks error name and message to be right
   * @param error error to check
   */
  public isInvalidUuidError(error: DatabaseError): boolean {
    return error.name === 'SequelizeDatabaseError' && error.message.includes('uuid');
  }
}
