import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * This is an auth guard that works based on the token passport strategy
 */
@Injectable()
export class UniqueTokenAuthGuard extends AuthGuard('token') {

}
