import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FactoryModule } from './factories';
import { UserUseCasesModule } from '@use-cases/user';
import { ErrorHandlerModule } from './error-handler';
import { MessageController } from './message.controller';
import { MessageUseCasesModule } from '@use-cases/message/message-use-cases.module';

/**
 * Controllers module, declare all controllers, import use cases and factories
 */
@Module({
  controllers: [UserController, MessageController],
  imports: [
    // factory module
    FactoryModule,
    // error handler module
    ErrorHandlerModule,
    // use cases
    UserUseCasesModule,
    MessageUseCasesModule,
  ],
})
export class ControllersModule {}
