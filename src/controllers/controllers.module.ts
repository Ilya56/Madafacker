import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FactoryModule } from './factories';
import { UserUseCasesModule } from '@use-cases/user';
import { ErrorHandlerModule } from './error-handler';
import { MessageController } from './message.controller';
import { MessageUseCasesModule } from '@use-cases/message';
import { ReplyController } from './reply.controller';
import { ReplyUseCasesModule } from '@use-cases/reply';
import { JobsModule } from '@jobs';
import { CronController } from './cron.controller';

/**
 * Controllers module, declare all controllers, import use cases and factories
 */
@Module({
  controllers: [UserController, MessageController, ReplyController, CronController],
  imports: [
    // factory module
    FactoryModule,
    // error handler module
    ErrorHandlerModule,
    // jobs
    JobsModule,
    // use cases
    UserUseCasesModule,
    MessageUseCasesModule,
    ReplyUseCasesModule,
  ],
})
export class ControllersModule {}
