import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { CoreError, DuplicateNotAllowedError, NotFoundError, OperationNotAllowedException } from '@core';
import { catchError, Observable, throwError } from 'rxjs';

/**
 * This interceptor process core error into the HTTP errors
 */
@Injectable()
export class CoreErrorHandler implements NestInterceptor {
  /**
   * Map core errors to the HTTP errors. Return new HTTP error based on core error
   * @param exception core type exception
   */
  catch(exception: Error | CoreError): any {
    if (!(exception instanceof CoreError)) {
      return new InternalServerErrorException(exception);
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
  }

  /**
   * Method to catch core errors using interceptor.
   * @param context an `ExecutionContext` object providing methods to access the
   * route handler and class about to be invoked.
   * @param next a reference to the `CallHandler`, which provides access to an
   * `Observable` representing the response stream from the route handler.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(catchError((err) => throwError(() => this.catch(err))));
  }
}
