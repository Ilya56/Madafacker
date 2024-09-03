import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';

/**
 * Monitor service now has no abstraction, it just works out of the box and auto-integrates with the system
 */
@Module({
  imports: [SentryModule.forRoot()],
})
export class SentryMonitorServiceModule {}
