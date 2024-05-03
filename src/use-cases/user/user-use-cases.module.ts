import { Module } from '@nestjs/common';
import { UserUseCase } from './user.use-case';
import { DataServicesModule } from '../../services/data-services/data-services.module';

@Module({
  imports: [DataServicesModule],
  providers: [UserUseCase],
  exports: [UserUseCase],
})
export class UserUseCasesModule {}
