import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebasePassportStrategy } from './firebase.passport-strategy';
import { GeneralGuard } from '@controllers';
import { DataServiceModule } from '@services';
import { FirebaseModule } from '@frameworks/firebase-module';

/**
 * This module is a Firebase auth strategy implementation. You can create another service to auth users
 */
@Module({
  imports: [forwardRef(() => DataServiceModule), FirebaseModule.forRootAsync()],
  providers: [GeneralGuard, FirebasePassportStrategy, { provide: APP_GUARD, useClass: FirebaseAuthGuard }],
})
export class FirebaseAuthStrategyModule {}
