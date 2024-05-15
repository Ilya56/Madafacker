import { Module } from '@nestjs/common';
import { GetCurrentUserUseCase, CreateUserUseCase, UpdateUserUseCase } from '@use-cases/user';
import { ServicesModule } from '@services';

@Module({
  imports: [ServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase],
})
export class UserUseCasesModule {}
