import { IncomeUserMessagesModel, MessageModel } from '../models';
import { SequelizeGenericRepository } from '../sequelize-generic-repository';
import { Message, MessageRepositoryAbstract, User } from '@core';
import { IncludeOptions } from 'sequelize';

/**
 * Sequelize message repository implementation
 */
export class SequelizeMessageRepository
  extends SequelizeGenericRepository<MessageModel, typeof MessageModel>
  implements MessageRepositoryAbstract
{
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

  /**
   * Retrieve all income user message models for a user with id userId with a populated message and returns only messages
   * @param userId user id to retrieve data
   * @param [repliesDepth=0] replies depth to retrieve
   */
  async getIncomingByUserId(userId: User['id'], repliesDepth = 0): Promise<Message[]> {
    const include = this.generateInclude(repliesDepth);
    const incomeUserMessagesModels = await IncomeUserMessagesModel.findAll({
      where: {
        userId,
      },
      include: {
        model: MessageModel,
        ...(include && { include }),
      },
    });
    return incomeUserMessagesModels.map((incomeMessage) => incomeMessage.message);
  }

  /**
   * Returns all messages with authorId is provided user id
   * @param userId user id to search
   * @param [repliesDepth=0] replies depth to retrieve
   */
  getOutcomingByUserId(userId: User['id'], repliesDepth = 0): Promise<Message[]> {
    const include = this.generateInclude(repliesDepth);
    return this.repository.findAll({
      where: {
        authorId: userId,
      },
      ...(include && { include }),
    });
  }

  /**
   * Generates Sequelize include an object with replies with specified depth
   * @param depth replies include depth
   * @private
   */
  protected generateInclude(depth: number): [IncludeOptions] | undefined {
    if (depth <= 0) {
      return; // Base case: no more nesting
    }

    const include = this.generateInclude(depth - 1);
    return [
      {
        model: MessageModel,
        as: 'replies',
        ...(include && { include }),
      },
    ];
  }

  /**
   * Returns all messages with flag wasSent = false
   */
  getNotSentMessages(): Promise<Message[]> {
    return this.repository.findAll({
      where: {
        wasSent: false,
      },
    });
  }

  /**
   * Set wasSent = true
   * @param message message to mark was sent
   */
  async markAsSent(message: Message): Promise<void> {
    const messageModel = Object.assign(message, { wasSent: true }) as MessageModel;
    await this.update(message.id, messageModel);
  }
}
