import { Module } from '@nestjs/common';
import { DataServicesModule } from '@services';
import { CreateUserUseCase } from '@use-cases/user';
import { UpdateUserUseCase } from '@use-cases/user';
import { GetUserByIdUseCase } from '@use-cases/user';

@Module({
  imports: [DataServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase],
})
export class UserUseCasesModule {}
