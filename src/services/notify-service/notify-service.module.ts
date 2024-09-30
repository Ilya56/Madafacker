import { Module } from '@nestjs/common';
import { FirebaseNotifyServiceModule } from '@frameworks/notify-service/firebase';

/**
 * This service defines what notify service implementation should be used now
 */
@Module({
  imports: [FirebaseNotifyServiceModule],
  exports: [FirebaseNotifyServiceModule],
})
export class NotifyServiceModule {}
