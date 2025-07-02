import { Module } from '@nestjs/common';
import { UserIdAuthStrategyModule } from '@frameworks/auth-strategy/user-id';

/**
 * This service defines what auth strategy service implementation should be used now
 */
@Module({
  imports: [UserIdAuthStrategyModule],
  exports: [UserIdAuthStrategyModule],
})
export class AuthStrategyModule {}
