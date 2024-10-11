import { Module } from '@nestjs/common';
import { SentryAlertServiceModule } from '@frameworks/alert-services/sentry';

/**
 * This service defines what alert service implementation should be used now
 */
@Module({
  imports: [SentryAlertServiceModule],
  exports: [SentryAlertServiceModule],
})
export class AlertServiceModule {}
