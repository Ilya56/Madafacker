import { SentryAlertServiceService } from '../sentry-alert-service.service';
import * as Sentry from '@sentry/nestjs';

describe('SentryAlertServiceService', () => {
  let sentryAlertService: SentryAlertServiceService;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    sentryAlertService = new SentryAlertServiceService();

    // Mock Sentry functions
    jest.spyOn(Sentry, 'captureException').mockImplementation(jest.fn());
    jest.spyOn(Sentry, 'flush').mockResolvedValue(true);

    // Spy on the logger's warn method
    loggerWarnSpy = jest.spyOn(sentryAlertService['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processException', () => {
    it('should capture the exception using Sentry successfully', async () => {
      const exception = new Error('Test exception');

      await sentryAlertService.processException(exception);

      expect(Sentry.captureException).toHaveBeenCalledWith(exception);
      expect(Sentry.flush).toHaveBeenCalledWith(1000);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should log a warning if Sentry.flush does not return true', async () => {
      jest.spyOn(Sentry, 'flush').mockResolvedValue(false); // Simulate failed flush

      const exception = new Error('Test exception');
      await sentryAlertService.processException(exception);

      expect(loggerWarnSpy).toHaveBeenCalledWith('Exception was not flushed after 1000 ms');
    });
  });
});
