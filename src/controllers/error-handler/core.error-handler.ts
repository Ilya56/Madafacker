import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import {
  CoreError,
  DuplicateNotAllowedError,
  InvalidNotifyServiceTokenException,
  NotFoundError,
  OperationNotAllowedException,
} from '@core';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import * as Sentry from '@sentry/nestjs';

/**
 * This interceptor process core error into the HTTP errors
 */
@Injectable()
export class CoreErrorHandler implements NestInterceptor {
  /**
   * Map core errors to the HTTP errors. Return new HTTP error based on core error
   * @param exception core type exception
   */
  async catch(exception: Error | CoreError): Promise<any> {
    Sentry.captureException(exception);
    await Sentry.flush(1000);

    if (exception instanceof HttpException) {
      return exception;
    }

    if (exception instanceof NotFoundError) {
      return new NotFoundException(exception.message);
    }
    if (exception instanceof DuplicateNotAllowedError) {
      return new BadRequestException(`Duplicated value is not allowed: ${exception.message}`);
    }
    if (exception instanceof OperationNotAllowedException) {
      return new BadRequestException(`Operation not allowed: ${exception.message}`);
    }
    if (exception instanceof InvalidNotifyServiceTokenException) {
      return new BadRequestException(`Invalid notify service token ${exception.token}: ${exception.message}`);
    }

    return new InternalServerErrorException(exception);
  }

  /**
   * Method to catch core errors using interceptor.
   * @param context an `ExecutionContext` object providing methods to access the
   * route handler and class about to be invoked.
   * @param next a reference to the `CallHandler`, which provides access to an
   * `Observable` representing the response stream from the route handler.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => from(this.catch(err)).pipe(switchMap((result) => throwError(() => result)))));
  }
}
