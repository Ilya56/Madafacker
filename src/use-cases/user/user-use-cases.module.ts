import { Module } from '@nestjs/common';
import { DataServicesModule, UserServicesModule } from '@services';
import { CreateUserUseCase } from '@use-cases/user';
import { UpdateUserUseCase } from '@use-cases/user';
import { GetCurrentUserUseCase } from '@use-cases/user';

@Module({
  imports: [DataServicesModule, UserServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase],
})
export class UserUseCasesModule {}
