import { Module } from '@nestjs/common';
import { UserUseCasesModule } from './use-cases/user/user-use-cases.module';

@Module({
  imports: [UserUseCasesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
