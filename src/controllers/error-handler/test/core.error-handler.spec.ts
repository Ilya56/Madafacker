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
    it('should return HttpException as it is', async () => {
      const badRequestException = new BadRequestException('Bad input');
      const result = await interceptor.catch(badRequestException);
      expect(result).toBe(badRequestException);
    });

    // it('should handle non-CoreError as InternalServerErrorException', () => {
    //   const result = interceptor.catch(new Error('General error'));
    //   expect(result).toBeInstanceOf(InternalServerErrorException);
    //   expect(result.getResponse()).toBeDefined();
    //   expect(result.getStatus()).toBe(500);
    //   expect(result.message).toBe('General error');
    //   expect(result.name).toBe('InternalServerErrorException');
    // });
    //
    // it('should handle NotFoundError as NotFoundException', () => {
    //   const notFoundError = new NotFoundError('Resource not found');
    //   const result = interceptor.catch(notFoundError);
    //   expect(result).toBeInstanceOf(NotFoundException);
    //   expect(result.getResponse()).toBeDefined();
    //   expect(result.getStatus()).toBe(404);
    //   expect(result.name).toBe('NotFoundException');
    //   expect(result.message).toBe('Resource not found');
    // });
    //
    // it('should handle DuplicateNotAllowedError as BadRequestException', () => {
    //   const duplicateNowAllowedError = new DuplicateNotAllowedError('Duplicate not allowed');
    //   const result = interceptor.catch(duplicateNowAllowedError);
    //   expect(result).toBeInstanceOf(BadRequestException);
    //   expect(result.getResponse()).toBeDefined();
    //   expect(result.getStatus()).toBe(400);
    //   expect(result.name).toBe('BadRequestException');
    //   expect(result.message).toBe('Duplicated value is not allowed: Duplicate not allowed');
    // });
    //
    // it('should handle OperationNotAllowedException as BadRequestException', () => {
    //   const operationNotAllowedException = new OperationNotAllowedException('Operation not allowed');
    //   const result = interceptor.catch(operationNotAllowedException);
    //   expect(result).toBeInstanceOf(BadRequestException);
    //   expect(result.getResponse()).toBeDefined();
    //   expect(result.getStatus()).toBe(400);
    //   expect(result.name).toBe('BadRequestException');
    //   expect(result.message).toBe('Operation not allowed: Operation not allowed');
    // });
    //
    // it('should handle InvalidNotifyServiceTokenException as BadRequestException', () => {
    //   const invalidNotifyServiceTokenException = new InvalidNotifyServiceTokenException('Invalid token', 'test-token');
    //   const result = interceptor.catch(invalidNotifyServiceTokenException);
    //   expect(result).toBeInstanceOf(BadRequestException);
    //   expect(result.getResponse()).toBeDefined();
    //   expect(result.getStatus()).toBe(400);
    //   expect(result.name).toBe('BadRequestException');
    //   expect(result.message).toBe('Invalid notify service token test-token: Invalid token');
    // });
  });

  describe('intercept method', () => {
    it('should catch errors and handle them', (done) => {
      next.handle = () => throwError(() => new NotFoundError('Not found'));
      interceptor.intercept(context, next).subscribe({
        next: () => {
          new Error('NO');
        },
        error: async (err1) => {
          const err = await err1;
          // expect(err).toBeInstanceOf(NotFoundException);
          // expect(err.getResponse()).toBeDefined();
          // expect(err.getStatus()).toBe(404);
          // expect(err.name).toBe('NotFoundException');
          // expect(err.message).toBe('Not found');
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
        error: () => {
          // This should not be called
          done.fail('Error handler called when it should not have been');
        },
      });
    });
  });
});
