import { Message } from './message.entity';

export class User {
  name: string;
  incomeMessages: Message[];
  outcomeMessages: Message[];
}
