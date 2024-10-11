import { AlertServiceAbstract } from '@core';
import * as Sentry from '@sentry/nestjs';
import { Injectable, Logger } from '@nestjs/common';

/**
 * This class implements Sentry exceptions capturing
 */
@Injectable()
export class SentryAlertServiceService extends AlertServiceAbstract {
  /** just logger */
  private readonly logger: Logger;

  /** Create new logger */
  constructor() {
    super();
    this.logger = new Logger(SentryAlertServiceService.name);
  }

  /**
   * Captures exception and flush it and this moment. This was done because current env is serverless,
   * and it should guarantee that exception was delivered to the Sentry
   * @param exception exception to send in Sentry
   */
  public async processException(exception: any): Promise<void> {
    Sentry.captureException(exception);
    const isFlushed = await Sentry.flush(1000);
    if (!isFlushed) {
      this.logger.warn('Exception was not flushed after 1000 ms');
    }
  }
}
