import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from '@use-cases/message';
import { ServicesModule } from '@services';

@Module({
  imports: [ServicesModule],
  providers: [CreateMessageUseCase],
  exports: [CreateMessageUseCase],
})
export class MessageUseCasesModule {}
