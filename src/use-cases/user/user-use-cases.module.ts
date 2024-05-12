import { Module } from '@nestjs/common';
import { DataServicesModule, UserServicesModule } from '@services';
import { GetCurrentUserUseCase, CreateUserUseCase, UpdateUserUseCase } from '@use-cases/user';

@Module({
  imports: [DataServicesModule, UserServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase],
})
export class UserUseCasesModule {}
