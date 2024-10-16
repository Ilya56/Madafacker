import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { MessageFactoryService } from './factories';
import { Message } from '@core';
import { CreateMessageDto, RatingDto } from './dtos';
import {
  CreateMessageUseCase,
  RateMessageUseCase,
  RetrieveIncomeMessagesUseCase,
  RetrieveOutcomeMessagesUseCase,
} from '@use-cases/message';

/**
 * Message actions controller. All related to the message should be here
 */
@Controller('api/message')
export class MessageController {
  constructor(
    private messageFactoryService: MessageFactoryService,
    private createMessageUseCase: CreateMessageUseCase,
    private retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase,
    private retrieveOutcomeMessagesUseCase: RetrieveOutcomeMessagesUseCase,
    private rateMessageUseCase: RateMessageUseCase,
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

  /**
   * Rate message from current user
   * @param messageId message to rate
   * @param rating rating to set
   */
  @Patch('/:id/rate')
  rate(@Param('id', ParseUUIDPipe) messageId: string, @Body() { rating }: RatingDto) {
    return this.rateMessageUseCase.execute({ messageId, rating });
  }
}
