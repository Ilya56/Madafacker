import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageFactoryService } from './factories';
import { Message } from '@core';
import { CreateMessageDto } from './dtos';
import {
  CreateMessageUseCase,
  RetrieveIncomeMessagesUseCase,
  RetrieveOutcomeMessagesUseCase,
} from '@use-cases/message';

/**
 * Message actions controller. All related to the user should be here
 */
@Controller('api/message')
export class MessageController {
  constructor(
    private messageFactoryService: MessageFactoryService,
    private createMessageUseCase: CreateMessageUseCase,
    private retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase,
    private retrieveOutcomeMessagesUseCase: RetrieveOutcomeMessagesUseCase,
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

  /**
   * Returns all incoming messages for current user
   */
  @Get('/current/incoming')
  retrieveIncoming() {
    return this.retrieveIncomeMessagesUseCase.execute();
  }

  /**
   * Returns all outcoming messages of the current user
   */
  @Get('/current/outcoming')
  retrieveOutcome() {
    return this.retrieveOutcomeMessagesUseCase.execute();
  }
}
