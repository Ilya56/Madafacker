import { IncomeUserMessage, Message, User } from '../../../entities';
import { MessageRating } from '../../../enums';
import { GenericRepositoryAbstract } from '../generic-repository.abstract';

/**
 * This interface is created to extend generic repository with a methods that are useful for an income user message entity
 */
export interface IncomeUserMessageRepositoryAbstract extends GenericRepositoryAbstract<IncomeUserMessage> {
  /**
   * Returns user rate on the message
   * @param userId user id who rated the message
   * @param messageId message id which was rated
   */
  getUserMessageRating(userId: User['id'], messageId: Message['id']): Promise<MessageRating | null>;

  /**
   * Updates message rating from user. If updated - return `true`. `false` in any other case
   * @param userId user id who rate message
   * @param messageId message to rate
   * @param rating rating
   */
  rateMessage(userId: User['id'], messageId: Message['id'], rating: MessageRating): Promise<boolean>;
}
