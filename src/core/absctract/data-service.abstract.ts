import { GenericRepositoryAbstract } from './generic-repository.abstract';
import { Message, Reply, User } from '../entities';

export abstract class DataServiceAbstract {
  abstract users: GenericRepositoryAbstract<User>;
  abstract messages: GenericRepositoryAbstract<Message>;
  abstract replies: GenericRepositoryAbstract<Reply>;
}
