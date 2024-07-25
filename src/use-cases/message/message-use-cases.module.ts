import { Module } from '@nestjs/common';
import { ServicesModule } from '@services';
import {
  CreateMessageUseCase,
  SendMessageUseCase,
  RetrieveIncomeMessagesUseCase,
  RetrieveOutcomeMessagesUseCase,
  RateMessageUseCase,
} from '@use-cases/message';

/**
 * Message use cases module for a Nest.js
 */
@Module({
  imports: [ServicesModule],
  providers: [
    CreateMessageUseCase,
    SendMessageUseCase,
    RetrieveIncomeMessagesUseCase,
    RetrieveOutcomeMessagesUseCase,
    RateMessageUseCase,
  ],
  exports: [
    CreateMessageUseCase,
    SendMessageUseCase,
    RetrieveIncomeMessagesUseCase,
    RetrieveOutcomeMessagesUseCase,
    RateMessageUseCase,
  ],
})
export class MessageUseCasesModule {}
