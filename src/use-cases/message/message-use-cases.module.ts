import { Module } from '@nestjs/common';
import { DataServicesModule, UserServicesModule } from '@services';
import { CreateMessageUseCase } from '@use-cases/message/create-message.use-case';

@Module({
  imports: [DataServicesModule, UserServicesModule],
  providers: [CreateMessageUseCase],
  exports: [CreateMessageUseCase],
})
export class UserUseCasesModule {}
