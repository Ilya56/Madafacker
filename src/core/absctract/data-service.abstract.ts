import { GenericRepositoryAbstract } from './generic-repository.abstract';
import { Message, Reply, User } from '../entities';

/**
 * This class defines what repositories should store a data service
 * Class don't know how it's implemented or how it's working, it knows only which entity can be used
 * in the whole project in the data storage service.
 */
export abstract class DataServiceAbstract {
  /**
   * List of repositories for each entity that can be stored in the data service
   */
  abstract users: GenericRepositoryAbstract<User>;
  abstract messages: GenericRepositoryAbstract<Message>;
  abstract replies: GenericRepositoryAbstract<Reply>;
}
