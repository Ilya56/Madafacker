import { MessageModel } from '../models';
import { Reply, ReplyRepositoryAbstract } from '@core';
import { SequelizeMessageRepository } from './sequelize-message-repository';

/**
 * Sequelize reply repository implementation
 */
export class SequelizeReplyRepository extends SequelizeMessageRepository implements ReplyRepositoryAbstract {
  /**
   * When create a reply need to retrieve author id from author and parent id from parent model
   * @param reply reply entity
   */
  create(reply: MessageModel): Promise<MessageModel> {
    reply.parentId = reply.parent.id;
    return super.create(reply);
  }

  getByIdWithPopulatedReplies(replyId: Reply['id'], repliesDepth = 0): Promise<Reply> {
    return Promise.resolve(new Reply());
  }
}
