import { Module } from '@nestjs/common';
import { CreateMessageUseCase, SendMessageUseCase } from '@use-cases/message';
import { ServicesModule } from '@services';

@Module({
  imports: [ServicesModule],
  providers: [CreateMessageUseCase, SendMessageUseCase],
  exports: [CreateMessageUseCase, SendMessageUseCase],
})
export class MessageUseCasesModule {}
