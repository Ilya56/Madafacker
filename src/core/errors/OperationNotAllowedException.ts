import { CoreError } from './CoreError';

/**
 * Indicates that requested operation cannot be allowed for some reason.
 * Reason should be written in the message field
 */
export class OperationNotAllowedException extends CoreError {}
