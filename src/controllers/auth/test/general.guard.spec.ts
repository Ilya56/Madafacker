import { Test, TestingModule } from '@nestjs/testing';
import { GeneralGuard } from '@controllers';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, Logger } from '@nestjs/common';

describe('GeneralGuard', () => {
  let guard: GeneralGuard;
  let reflector: Reflector;
  let configService: ConfigService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<GeneralGuard>(GeneralGuard);
    reflector = module.get<Reflector>(Reflector);
    configService = module.get<ConfigService>(ConfigService);
    logger = new Logger(GeneralGuard.name);
    guard['logger'] = logger;
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return null for non-public routes without API key', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce(null);

      expect(guard.canActivate(context)).toBeNull();
    });

    it('should return false if API key is not defined', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce({ apiKeyValue: null });
      jest.spyOn(configService, 'get').mockReturnValue(null);
      const loggerSpy = jest.spyOn(logger, 'error');

      expect(guard.canActivate(context)).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Api key is not defined in the configurations, please define it. Request rejected',
      );
    });

    it('should return true if API key matches', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn().mockReturnValue({ headers: { 'x-api-key': 'valid-api-key' } }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce({ apiKeyValue: 'valid-api-key' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if API key does not match', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn().mockReturnValue({ headers: { 'x-api-key': 'invalid-api-key' } }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce({ apiKeyValue: 'valid-api-key' });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should use config service to get API key if not provided in metadata', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn().mockReturnValue({ headers: { 'x-api-key': 'valid-api-key' } }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false).mockReturnValueOnce({ apiKeyValue: null });
      jest.spyOn(configService, 'get').mockReturnValue('valid-api-key');

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
