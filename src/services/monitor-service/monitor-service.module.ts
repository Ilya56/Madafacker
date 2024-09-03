import { Module } from '@nestjs/common';
import { SentryMonitorServiceModule } from '@frameworks/monitor-service/sentry/sentry-monitor-service.module';

/**
 * This service defines what monitor service implementation should be used now
 */
@Module({
  imports: [SentryMonitorServiceModule],
  exports: [SentryMonitorServiceModule],
})
export class MonitorServiceModule {}
