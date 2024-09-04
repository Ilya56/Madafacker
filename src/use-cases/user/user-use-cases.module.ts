import { Module } from '@nestjs/common';
import { GetCurrentUserUseCase, CreateUserUseCase, UpdateUserUseCase } from '@use-cases/user';
import { ServicesModule } from '@services';
import { CheckUsernameAvailableUseCase } from '@use-cases/user/check-username-available.use-case';

/**
 * User use cases module for a Nest.js
 */
@Module({
  imports: [ServicesModule],
  providers: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase, CheckUsernameAvailableUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, GetCurrentUserUseCase, CheckUsernameAvailableUseCase],
})
export class UserUseCasesModule {}
