import { Module } from '@nestjs/common';
import { CoreErrorHandler } from './core.error-handler';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AlertServiceModule } from '@services';

/**
 * Global error handler module
 */
@Module({
  imports: [AlertServiceModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CoreErrorHandler,
    },
  ],
})
export class ErrorHandlerModule {}
