import { Module } from '@nestjs/common';
import { UserUseCasesModule } from './use-cases/user/user-use-cases.module';
import { FactoryModule } from './controllers';

@Module({
  imports: [UserUseCasesModule, FactoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
