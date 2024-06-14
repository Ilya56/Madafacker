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
    const incomeUserMessagesModels = await IncomeUserMessagesModel.findAll({
      where: {
        userId,
      },
      include: MessageModel,
    });
    return this.fillMessagesWithReplies(
      incomeUserMessagesModels.map((incomeMessage) => incomeMessage.message),
      repliesDepth,
    );
  }

  /**
   * Returns all messages with authorId is provided user id
   * @param userId user id to search
   * @param [repliesDepth=0] replies depth to retrieve
   */
  async getOutcomingByUserId(userId: User['id'], repliesDepth = 0): Promise<Message[]> {
    const outcomeMessageModels = await this.repository.findAll({
      where: {
        authorId: userId,
      },
    });
    return this.fillMessagesWithReplies(outcomeMessageModels, repliesDepth);
  }

  /**
   * Fill a message array with replies
   * @param messages messages to fill with replies
   * @param repliesDepth replies depth
   * @private
   */
  protected fillMessagesWithReplies(messages: MessageModel[], repliesDepth: number): Promise<MessageModel[]> {
    if (repliesDepth <= 0) {
      return Promise.resolve(messages);
    }

    return Promise.all(
      messages.map((message) => this.addRepliesToMessage(message, repliesDepth, false) as Promise<MessageModel>),
    );
  }

  /**
   * Generates Sequelize include an object with replies with specified depth
   * @param depth replies include depth
   * @private
   */
  private generateInclude(depth: number): [IncludeOptions] | undefined {
    if (depth <= 0) {
      return; // Base case: no more nesting
    }

    return [
      {
        model: MessageModel,
        as: 'replies',
        include: this.generateInclude(depth - 1),
      },
    ];
  }

  /**
   * Returns the message object with replies with specified depth
   * @param message message object to populate replies
   * @param repliesDepth replies depth to populate
   * @param returnNewMessage if true - returns a retrieved message, otherwise returns a message from params
   * @private
   */
  protected async addRepliesToMessage(
    message: MessageModel,
    repliesDepth: number,
    returnNewMessage: boolean,
  ): Promise<MessageModel | null> {
    if (repliesDepth <= 0) {
      return message;
    }

    const newMessage = await this.repository.findByPk(message.id, {
      include: this.generateInclude(repliesDepth),
    });

    if (returnNewMessage) {
      return newMessage;
    }

    if (newMessage) {
      message.replies = newMessage.replies;
    }

    return message;
  }
}
