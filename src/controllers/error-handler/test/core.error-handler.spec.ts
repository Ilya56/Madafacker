import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CoreErrorHandler } from '../core.error-handler';
import {
  DuplicateNotAllowedError,
  InvalidNotifyServiceTokenException,
  NotFoundError,
  OperationNotAllowedException,
} from '@core';
import { of, throwError } from 'rxjs';
import { AlertServiceAbstract } from '@core';

describe('CoreErrorHandler', () => {
  let interceptor: CoreErrorHandler;
  let context: ExecutionContext;
  let next: CallHandler;
  let alertService: AlertServiceAbstract;

  beforeEach(async () => {
    const alertServiceMock = {
      processException: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreErrorHandler, { provide: AlertServiceAbstract, useValue: alertServiceMock }],
    }).compile();

    interceptor = module.get<CoreErrorHandler>(CoreErrorHandler);
    alertService = module.get<AlertServiceAbstract>(AlertServiceAbstract);
    context = {} as ExecutionContext;
    next = {
      handle: () => of({}),
    } as CallHandler;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch method', () => {
    it('should return HttpException as it is', async () => {
      const badRequestException = new BadRequestException('Bad input');
      const result = await interceptor.catch(badRequestException);
      expect(result).toBe(badRequestException);
    });

    it('should handle non-CoreError as InternalServerErrorException and call alertService', async () => {
      const error = new Error('General error');
      const result = await interceptor.catch(error);

      expect(result).toBeInstanceOf(InternalServerErrorException);
      expect(result.getResponse()).toBeDefined();
      expect(result.getStatus()).toBe(500);
      expect(result.message).toBe('General error');
      expect(result.name).toBe('InternalServerErrorException');

      expect(alertService.processException).toHaveBeenCalledWith(error);
    });

    it('should handle NotFoundError as NotFoundException', async () => {
      const notFoundError = new NotFoundError('Resource not found');
      const result = await interceptor.catch(notFoundError);

      expect(result).toBeInstanceOf(NotFoundException);
      expect(result.getResponse()).toBeDefined();
      expect(result.getStatus()).toBe(404);
      expect(result.name).toBe('NotFoundException');
      expect(result.message).toBe('Resource not found');
    });

    it('should handle DuplicateNotAllowedError as BadRequestException', async () => {
      const duplicateNowAllowedError = new DuplicateNotAllowedError('Duplicate not allowed');
      const result = await interceptor.catch(duplicateNowAllowedError);

      expect(result).toBeInstanceOf(BadRequestException);
      expect(result.getResponse()).toBeDefined();
      expect(result.getStatus()).toBe(400);
      expect(result.name).toBe('BadRequestException');
      expect(result.message).toBe('Duplicated value is not allowed: Duplicate not allowed');
    });

    it('should handle OperationNotAllowedException as BadRequestException', async () => {
      const operationNotAllowedException = new OperationNotAllowedException('Operation not allowed');
      const result = await interceptor.catch(operationNotAllowedException);

      expect(result).toBeInstanceOf(BadRequestException);
      expect(result.getResponse()).toBeDefined();
      expect(result.getStatus()).toBe(400);
      expect(result.name).toBe('BadRequestException');
      expect(result.message).toBe('Operation not allowed: Operation not allowed');
    });

    it('should handle InvalidNotifyServiceTokenException as BadRequestException', async () => {
      const invalidNotifyServiceTokenException = new InvalidNotifyServiceTokenException('Invalid token', 'test-token');
      const result = await interceptor.catch(invalidNotifyServiceTokenException);

      expect(result).toBeInstanceOf(BadRequestException);
      expect(result.getResponse()).toBeDefined();
      expect(result.getStatus()).toBe(400);
      expect(result.name).toBe('BadRequestException');
      expect(result.message).toBe('Invalid notify service token test-token: Invalid token');
    });
  });

  describe('intercept method', () => {
    it('should catch errors and handle them', (done) => {
      next.handle = () => throwError(() => new NotFoundError('Not found'));
      interceptor.intercept(context, next).subscribe({
        next: () => done.fail('Unexpected success'),
        error: (err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.getResponse()).toBeDefined();
          expect(err.getStatus()).toBe(404);
          expect(err.name).toBe('NotFoundException');
          expect(err.message).toBe('Not found');
          done();
        },
      });
    });

    it('should pass through when no error occurs', (done) => {
      next.handle = () => of({ success: true });
      interceptor.intercept(context, next).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
          done();
        },
        error: () => done.fail('Error handler called when it should not have been'),
      });
    });
  });
});
