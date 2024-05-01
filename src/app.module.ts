import { Module } from '@nestjs/common';
import { UserUseCasesModule } from './use-cases/user/user-use-cases.module';
import { UserController } from './controllers';
import { FactoryModule } from './controllers';

@Module({
  imports: [UserUseCasesModule, FactoryModule],
  controllers: [UserController],
  providers: [],
})
export class AppModule {}
