import { Message } from './message.entity';
import { ReplyPublicFlag } from '../enums';

export class Reply extends Message {
  parent: Message;
  public: ReplyPublicFlag;
}
