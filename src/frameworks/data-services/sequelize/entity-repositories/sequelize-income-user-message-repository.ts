import { IncomeUserMessagesModel } from '../models';
import { SequelizeGenericRepository } from '../sequelize-generic-repository';
import { IncomeUserMessageRepositoryAbstract, Message, User, MessageRatingStats, MessageRating } from '@core';
import { col, fn, Op } from 'sequelize';

/**
 * Sequelize income user message repository implementation
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

  /**
   * Returns rating statistics for a list of messages
   * @param messageIds
   */
  async getRatingStatsByMessageIds(messageIds: Message['id'][]): Promise<Record<string, MessageRatingStats>> {
    type RatingWithCount = { messageId: string; rating: MessageRating; count: string };

    const ratings = (await IncomeUserMessagesModel.findAll({
      where: {
        messageId: { [Op.in]: messageIds },
        rating: { [Op.ne]: null },
      },
      attributes: ['messageId', 'rating', [fn('COUNT', col('rating')), 'count']],
      group: ['messageId', 'rating'],
      raw: true,
    })) as unknown as RatingWithCount[];

    const result: Record<string, MessageRatingStats> = {};
    messageIds.forEach((messageId) => {
      result[messageId] = { likes: 0, dislikes: 0, superLikes: 0 };
    });

    ratings.forEach((rating) => {
      const count = parseInt(rating.count, 10);

      if (rating.rating === MessageRating.like) {
        result[rating.messageId].likes = count;
      }
      if (rating.rating === MessageRating.dislike) {
        result[rating.messageId].dislikes = count;
      }
      if (rating.rating === MessageRating.superlike) {
        result[rating.messageId].superLikes = count;
      }
    });

    return result;
  }

  /**
   * Returns user ratings for a list of messages
   * @param userId
   * @param messageIds
   */
  async getUserRatingsByMessageIds(
    userId: User['id'],
    messageIds: Message['id'][],
  ): Promise<Record<string, MessageRating>> {
    type Rating = { messageId: string; rating: MessageRating; count: string };

    const ratings = (await IncomeUserMessagesModel.findAll({
      where: {
        userId,
        messageId: { [Op.in]: messageIds },
        rating: { [Op.ne]: null },
      },
      attributes: ['messageId', 'rating'],
      raw: true,
    })) as unknown as Rating[];

    const result: Record<string, MessageRating> = {};
    ratings.forEach((rating) => {
      result[rating.messageId] = rating.rating;
    });

    return result;
  }
}
