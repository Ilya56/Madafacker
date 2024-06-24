import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { CoreErrorHandler } from '../core.error-handler';
import { DuplicateNotAllowedError, NotFoundError } from '@core';
import { of, throwError } from 'rxjs';

describe('CoreErrorHandler', () => {
  let interceptor: CoreErrorHandler;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreErrorHandler],
    }).compile();

    interceptor = module.get<CoreErrorHandler>(CoreErrorHandler);
    context = {} as ExecutionContext;
    next = {
      handle: () => of({}),
    } as CallHandler;
  });

  describe('catch method', () => {
    it('should handle non-CoreError as InternalServerErrorException', () => {
      const result = interceptor.catch(new Error('General error'));
      expect(result.response).toBeDefined();
      expect(result.status).toBe(500);
      expect(result.message).toBe('General error');
      expect(result.name).toBe('InternalServerErrorException');
    });

    it('should handle NotFoundError as NotFoundException', () => {
      const notFoundError = new NotFoundError('Resource not found');
      const result = interceptor.catch(notFoundError);
      expect(result.response).toBeDefined();
      expect(result.status).toBe(404);
      expect(result.name).toBe('NotFoundException');
      expect(result.message).toBe('Resource not found');
    });

    it('should handle DuplicateNotAllowedError as BadRequestException', () => {
      const duplicateNowAllowedError = new DuplicateNotAllowedError('Duplicate not allowed');
      const result = interceptor.catch(duplicateNowAllowedError);
      expect(result.response).toBeDefined();
      expect(result.status).toBe(400);
      expect(result.name).toBe('BadRequestException');
      expect(result.message).toBe('Duplicated value is not allowed: Duplicate not allowed');
    });
  });

  describe('intercept method', () => {
    it('should catch errors and handle them', (done) => {
      next.handle = () => throwError(() => new NotFoundError('Not found'));
      Promise.resolve(interceptor.intercept(context, next)).then((observable) =>
        observable.subscribe({
          next: () => {},
          error: (err) => {
            expect(err.response).toBeDefined();
            expect(err.status).toBe(404);
            expect(err.message).toBe('Not found');
            done();
          },
        }),
      );
    });
  });
});
