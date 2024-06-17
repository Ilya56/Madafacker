import { CoreError } from './CoreError';

/**
 * Duplicate value is not allowed.
 * Can be used in case of unique key error handling
 */
export class DuplicateNotAllowedError extends CoreError {}
