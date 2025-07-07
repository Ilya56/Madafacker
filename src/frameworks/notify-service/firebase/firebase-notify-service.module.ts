import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotifyServiceAbstract } from '@core';
import { FirebaseNotifyServiceService } from './firebase-notify-service.service';
import { FirebaseModule } from '@frameworks/firebase-module';

/**
 * This module is a Firebase notification service implementation
 */
@Module({
  imports: [ConfigModule, FirebaseModule.forRootAsync()],
  providers: [{ provide: NotifyServiceAbstract, useClass: FirebaseNotifyServiceService }],
  exports: [NotifyServiceAbstract],
})
export class FirebaseNotifyServiceModule {}
