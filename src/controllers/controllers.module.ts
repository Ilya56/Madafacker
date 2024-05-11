import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { FactoryModule } from './factories';
import { UserUseCasesModule } from '@use-cases/user';

/**
 * Controllers module, declare all controllers, import use cases and factories
 */
@Module({
  controllers: [UserController],
  imports: [FactoryModule, UserUseCasesModule],
})
export class ControllersModule {}
