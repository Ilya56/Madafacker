import { IncomeUserMessagesModel, MessageModel, SequelizeGenericRepository } from '@frameworks/data-services/sequelize';
import { Message, MessageRepositoryAbstract, User } from '@core';

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
   */
  async getIncomingByUserId(userId: User['id']): Promise<Message[]> {
    const incomeUserMessagesModels = await IncomeUserMessagesModel.findAll({
      where: {
        userId,
      },
      include: MessageModel,
    });
    return incomeUserMessagesModels.map((incomeMessage) => incomeMessage.message);
  }
}
