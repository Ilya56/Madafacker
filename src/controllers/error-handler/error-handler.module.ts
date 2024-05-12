import { Module } from '@nestjs/common';
import { CoreErrorHandler } from './core.error-handler';
import { APP_INTERCEPTOR } from '@nestjs/core';

/**
 * Global error handler module
 */
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CoreErrorHandler,
    },
  ],
})
export class ErrorHandlerModule {}
