import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UniqueTokenAuthGuard } from './unique-token-auth.guard';
import { UniqueTokenPassportStrategy } from './unique-token.passport-strategy';
import { GeneralGuard } from '@controllers';
import { DataServiceModule } from '@services';

/**
 * This module is a User ID auth strategy implementation. You can create another service to auth users
 */
@Module({
  imports: [forwardRef(() => DataServiceModule)],
  providers: [GeneralGuard, UniqueTokenPassportStrategy, { provide: APP_GUARD, useClass: UniqueTokenAuthGuard }],
})
export class UserIdAuthStrategyModule {}
