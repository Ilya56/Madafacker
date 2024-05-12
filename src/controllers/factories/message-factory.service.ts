import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '@controllers';
import { Message } from '@core';

/**
 * This class is created to process data from HTTP to Entity
 */
@Injectable()
export class MessageFactoryService {
  /**
   * Creates and returns new message entity based on the creation message dto
   * @param createMessage create message data from request
   */
  public createNewMessage(createMessage: CreateMessageDto): Message {
    const message = new Message();
    message.body = createMessage.body;
    message.mode = createMessage.mode;
    return message;
  }
}
