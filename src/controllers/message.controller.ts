import { Body, Controller, Post } from '@nestjs/common';
import { MessageFactoryService } from './factories';
import { CreateMessageUseCase } from '@use-cases/message/create-message.use-case';
import { Message } from '@core';
import { CreateMessageDto } from './dtos';

/**
 * Message actions controller. All related to the user should be here
 */
@Controller('api/message')
export class MessageController {
  constructor(
    private messageFactoryService: MessageFactoryService,
    private createMessageUseCase: CreateMessageUseCase,
  ) {}

  /**
   * Creates new message
   * @param messageDto new message data
   */
  @Post()
  create(@Body() messageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageFactoryService.createNewMessage(messageDto);
    return this.createMessageUseCase.execute(message);
  }
}
