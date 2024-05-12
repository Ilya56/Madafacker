import { MessageModel } from '@frameworks/data-services/sequelize/models';
import { SequelizeGenericRepository } from '@frameworks/data-services/sequelize/sequelize-generic-repository';

/**
 * Sequelize message repository implementation
 */
export class SequelizeMessageRepository extends SequelizeGenericRepository<MessageModel, typeof MessageModel> {
  constructor() {
    super(MessageModel);
  }

  /**
   * When create a message need to retrieve author id from author
   * @param message message entity
   */
  create(message: MessageModel): Promise<MessageModel> {
    message.authorId = message.author.id;
    return super.create(message);
  }
}
