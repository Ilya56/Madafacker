import {
  MessageRepositoryAbstract,
  UserRepositoryAbstract,
  ReplyRepositoryAbstract,
  IncomeUserMessageRepositoryAbstract,
} from './entity-repositories';

/**
 * This class defines what repositories should store a data service
 * Class don't know how it's implemented or how it's working, it knows only which entity can be used
 * in the whole project in the data storage service.
 */
export abstract class DataServiceAbstract {
  /**
   * List of repositories for each entity that can be stored in the data service
   */
  abstract users: UserRepositoryAbstract;
  abstract messages: MessageRepositoryAbstract;
  abstract replies: ReplyRepositoryAbstract;
  abstract incomeUserMessage: IncomeUserMessageRepositoryAbstract;

  /**
   * Transactional decorator to make all requests in the function in one transaction
   */
  public abstract transactional<I, O>(func: (...args: I[]) => O): Promise<O>;

  /**
   * Returns true if error is about invalid uuid
   * @param error error to check
   */
  public abstract isInvalidUuidError(error: Error): boolean;
}
