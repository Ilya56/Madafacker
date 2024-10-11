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
  AlertServiceAbstract,
  CoreError,
  DuplicateNotAllowedError,
  InvalidNotifyServiceTokenException,
  NotFoundError,
  OperationNotAllowedException,
} from '@core';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';

/**
 * This interceptor process core error into the HTTP errors
 */
@Injectable()
export class CoreErrorHandler implements NestInterceptor {
  /**
   * Inject alert service to use it in case of unexpected error
   * @param alertService
   */
  constructor(private readonly alertService: AlertServiceAbstract) {}

  /**
   * Map core errors to the HTTP errors. Return new HTTP error based on core error
   * @param exception core type exception
   */
  async catch(exception: Error | CoreError): Promise<any> {
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

    await this.alertService.processException(exception);

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
