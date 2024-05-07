import { SetMetadata } from '@nestjs/common';

/**
 * Public controller meta key
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Sets controller as public. That should allow using route without any permissions
 * @constructor
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
