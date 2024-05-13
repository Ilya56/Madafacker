import { Module } from '@nestjs/common';
import { DataServicesModule, UserServicesModule } from '@services';
import { CreateMessageUseCase, SendMessageUseCase } from '@use-cases/message';

@Module({
  imports: [DataServicesModule, UserServicesModule],
  providers: [CreateMessageUseCase, SendMessageUseCase],
  exports: [CreateMessageUseCase, SendMessageUseCase],
})
export class MessageUseCasesModule {}
