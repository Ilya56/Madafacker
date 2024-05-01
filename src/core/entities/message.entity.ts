import { MessageMode } from '../enums';
import { User } from './user.entity';

export class Message {
  body: string;
  author: User;
  mode: MessageMode;
}
