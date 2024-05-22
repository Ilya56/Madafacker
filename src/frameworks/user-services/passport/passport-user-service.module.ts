import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserServiceAbstract } from '@core';
import { DataServiceModule } from '@services';
import { UniqueTokenAuthGuard } from './unique-token-auth.guard';
import { PassportUserServiceService } from './passport-user-service.service';
import { UniqueTokenPassportStrategy } from './unique-token.passport-strategy';

/**
 * This module is a Passport user service implementation. You can create another service to implement UserServiceAbstract
 */
@Module({
  imports: [forwardRef(() => DataServiceModule)],
  providers: [
    UniqueTokenPassportStrategy,
    { provide: UserServiceAbstract, useClass: PassportUserServiceService },
    { provide: APP_GUARD, useClass: UniqueTokenAuthGuard },
  ],
  exports: [UserServiceAbstract],
})
export class PassportUserServiceModule {}
