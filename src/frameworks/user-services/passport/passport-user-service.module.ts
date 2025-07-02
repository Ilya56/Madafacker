import { forwardRef, Module } from '@nestjs/common';
import { UserServiceAbstract } from '@core';
import { DataServiceModule } from '@services';
import { PassportUserServiceService } from './passport-user-service.service';

/**
 * This module is a Passport user service implementation. You can create another service to implement UserServiceAbstract
 */
@Module({
  imports: [forwardRef(() => DataServiceModule)],
  providers: [{ provide: UserServiceAbstract, useClass: PassportUserServiceService }],
  exports: [UserServiceAbstract],
})
export class PassportUserServiceModule {}
