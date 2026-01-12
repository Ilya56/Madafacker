import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { MessageFactoryService } from './factories';
import { CreateMessageDto, PublicMessageDto, RatingDto, PrivateMessageDto } from './dtos';
import {
  CreateMessageUseCase,
  RateMessageUseCase,
  RetrieveIncomeMessagesUseCase,
  RetrieveOutcomeMessagesUseCase,
} from '@use-cases/message';
import { plainToInstance } from 'class-transformer';

/**
 * Message actions controller. All related to the message should be here
 */
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true })
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
  async create(@Body() messageDto: CreateMessageDto): Promise<PrivateMessageDto> {
    const message = this.messageFactoryService.createNewMessage(messageDto);
    const createdMessage = await this.createMessageUseCase.execute(message);
    return plainToInstance(PrivateMessageDto, createdMessage);
  }

  /**
   * Returns all incoming messages for current user
   */
  @Get('/current/incoming')
  async retrieveIncoming(): Promise<PublicMessageDto[]> {
    const messages = await this.retrieveIncomeMessagesUseCase.execute();
    return plainToInstance(PublicMessageDto, messages);
  }

  /**
   * Returns all outcoming messages of the current user
   */
  @Get('/current/outcoming')
  async retrieveOutcome(): Promise<PrivateMessageDto[]> {
    const messages = await this.retrieveOutcomeMessagesUseCase.execute();
    return plainToInstance(PrivateMessageDto, messages);
  }

  /**
   * Rate message from current user
   * @param messageId message to rate
   * @param rating rating to set
   */
  @Patch('/:id/rate')
  rate(@Param('id', ParseUUIDPipe) messageId: string, @Body() { rating }: RatingDto): Promise<void> {
    return this.rateMessageUseCase.execute({ messageId, rating });
  }
}
