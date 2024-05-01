import { Module } from '@nestjs/common';
import { UserUseCase } from './user.use-case';

@Module({
  imports: [], // TODO: import here data service
  providers: [UserUseCase],
  exports: [UserUseCase],
})
export class UserUseCasesModule {}
