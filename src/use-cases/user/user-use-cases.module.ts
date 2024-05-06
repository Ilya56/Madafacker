import { Module } from '@nestjs/common';
import { DataServicesModule } from '@services/data-services/data-services.module';
import { CreateUserUseCase } from '@use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '@use-cases/user/update-user.use-case';
import { GetUserByIdUseCase } from '@use-cases/user/get-user-by-id.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetUserByIdUseCase],
})
export class UserUseCasesModule {}
