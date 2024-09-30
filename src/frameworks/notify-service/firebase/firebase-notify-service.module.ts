import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotifyServiceAbstract } from '@core';
import { FirebaseNotifyServiceService } from './firebase-notify-service.service';

/**
 * This module is a Firebase notification service implementation
 */
@Module({
  imports: [ConfigModule],
  providers: [{ provide: NotifyServiceAbstract, useClass: FirebaseNotifyServiceService }],
  exports: [NotifyServiceAbstract],
})
export class FirebaseNotifyServiceModule {}
