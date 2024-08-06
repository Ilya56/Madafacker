import { MessageRating } from 'src/core/enums/MessageRating';
import { IncomeUserMessagesModel } from '../models';
import { SequelizeGenericRepository } from '../sequelize-generic-repository';
import { IncomeUserMessageRepositoryAbstract, Message, User } from '@core';

/**
 * Sequelize message repository implementation
 */
export class SequelizeIncomeUserMessageRepository
  extends SequelizeGenericRepository<IncomeUserMessagesModel, typeof IncomeUserMessagesModel>
  implements IncomeUserMessageRepositoryAbstract
{
  constructor() {
    super(IncomeUserMessagesModel);
  }

  /**
   * Retrieves rating from income user message model based on user and message id
   * @param userId
   * @param messageId
   */
  async getUserMessageRating(userId: User['id'], messageId: Message['id']): Promise<MessageRating | null> {
    const incomeUserMessage = await IncomeUserMessagesModel.findOne({
      where: {
        userId,
        messageId,
      },
    });

    if (!incomeUserMessage) {
      return null;
    }

    return incomeUserMessage?.rating || null;
  }

  /**
   * Update income user message model rating field on the message from user
   * If at least one row was updated it returns true. Otherwise - false
   * @param userId
   * @param messageId
   * @param rating
   */
  async rateMessage(userId: User['id'], messageId: Message['id'], rating: MessageRating): Promise<boolean> {
    const [updatedCount] = await IncomeUserMessagesModel.update(
      {
        rating,
      },
      {
        where: {
          userId,
          messageId,
        },
      },
    );
    return updatedCount > 0;
  }
}
