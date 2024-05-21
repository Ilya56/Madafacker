import { Module } from '@nestjs/common';
import { CreateMessageUseCase, SendMessageUseCase, RetrieveIncomeMessagesUseCase } from '@use-cases/message';
import { ServicesModule } from '@services';

@Module({
  imports: [ServicesModule],
  providers: [CreateMessageUseCase, SendMessageUseCase, RetrieveIncomeMessagesUseCase],
  exports: [CreateMessageUseCase, SendMessageUseCase, RetrieveIncomeMessagesUseCase],
})
export class MessageUseCasesModule {}
