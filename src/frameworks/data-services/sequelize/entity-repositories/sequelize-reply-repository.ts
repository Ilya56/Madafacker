import { SequelizeGenericRepository } from '../sequelize-generic-repository';
import { MessageModel } from '../models';

/**
 * Sequelize reply repository implementation
 */
export class SequelizeReplyRepository extends SequelizeGenericRepository<MessageModel, typeof MessageModel> {
  constructor() {
    super(MessageModel);
  }

  /**
   * When create a reply need to retrieve author id from author and parent id from parent model
   * @param reply reply entity
   */
  create(reply: MessageModel): Promise<MessageModel> {
    reply.authorId = reply.author.id;
    reply.parentId = reply.parent.id;
    return super.create(reply);
  }
}
