import { GenericRepositoryAbstract } from './generic-repository.abstract';
import { Reply } from '../entities';
import { UserRepositoryAbstract } from './entity-repositories';
import { MessageRepositoryAbstract } from './entity-repositories/message-repository.abstract';

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
  abstract replies: GenericRepositoryAbstract<Reply>;

  /**
   * Transactional decorator to make all requests in the function in one transaction
   */
  public abstract transactional<I, O>(func: (...args: I[]) => O): Promise<O>;
}
