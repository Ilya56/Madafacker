import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  tracePropagationTargets: [],
  // adapter on the Vercel
  environment: process.env.VERCEL_ENV || 'dev',
  skipOpenTelemetrySetup: true,
});
