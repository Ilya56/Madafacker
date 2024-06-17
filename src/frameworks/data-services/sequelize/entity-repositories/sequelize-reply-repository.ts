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

  /**
   * If reply depth is 0, it just returns regular reply by request in the Sequelize.
   * Otherwise, it uses method from the message repository to retrieve a message with populated replies
   * @param replyId it of the reply to retrieve
   * @param repliesDepth replies depth level
   */
  getByIdWithPopulatedReplies(replyId: Reply['id'], repliesDepth = 0): Promise<MessageModel | null> {
    const include = this.generateInclude(repliesDepth);
    return this.repository.findByPk(replyId, {
      ...(include && { include }),
    });
  }
}
