import { Module } from '@nestjs/common';
import { FirebaseAuthStrategyModule } from '@frameworks/auth-strategy/firebase-auth';

/**
 * This service defines what auth strategy service implementation should be used now
 */
@Module({
  imports: [FirebaseAuthStrategyModule],
  exports: [FirebaseAuthStrategyModule],
})
export class AuthStrategyModule {}
