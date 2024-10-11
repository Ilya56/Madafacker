import { Module } from '@nestjs/common';
import { AlertServiceAbstract } from '@core';
import { SentryAlertServiceService } from '@frameworks/alert-services/sentry/sentry-alert-service.service';

/**
 * This module is a Sentry alert service implementation
 */
@Module({
  providers: [{ provide: AlertServiceAbstract, useClass: SentryAlertServiceService }],
  exports: [AlertServiceAbstract],
})
export class SentryAlertServiceModule {}
