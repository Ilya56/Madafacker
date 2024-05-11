import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FactoryModule } from './factories';
import { UserUseCasesModule } from '@use-cases/user';
import { ErrorHandlerModule } from './error-handler';

/**
 * Controllers module, declare all controllers, import use cases and factories
 */
@Module({
  controllers: [UserController],
  imports: [
    // factory module
    FactoryModule,
    // error handler module
    ErrorHandlerModule,
    // controllers
    UserUseCasesModule,
  ],
})
export class ControllersModule {}
