import { Message } from './message.entity';

export class Reply extends Message {
  parent: Message;
  public: boolean;
}
