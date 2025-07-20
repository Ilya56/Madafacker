import { SetMetadata } from '@nestjs/common';

/**
 * Registration controller meta key
 */
export const IS_REGISTRATION_KEY = Symbol('isRegistrationKey');

/**
 * Sets controller as registration point. That should allow using route with another login than usual
 *  In the context of provide OAuth this means that this endpoint should verify token,
 * but create a user based on it, not search for it
 * @constructor
 */
export const Registration = () => SetMetadata(IS_REGISTRATION_KEY, true);
