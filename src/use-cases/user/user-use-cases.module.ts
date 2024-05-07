import { Module } from '@nestjs/common';
import { DataServicesModule, UserServicesModule } from '@services';
import { CreateUserUseCase } from '@use-cases/user';
import { UpdateUserUseCase } from '@use-cases/user';
import { GetUserByIdUseCase } from '@use-cases/user';

@Module({
  imports: [DataServicesModule, UserServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase],
})
export class UserUseCasesModule {}
