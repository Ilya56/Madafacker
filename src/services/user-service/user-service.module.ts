import { Module } from '@nestjs/common';
import { PassportUserServiceModule } from '@frameworks/user-services/passport';

/**
 * This service defines what user service implementation should be used now
 */
@Module({
  imports: [PassportUserServiceModule],
  exports: [PassportUserServiceModule],
})
export class UserServiceModule {}
