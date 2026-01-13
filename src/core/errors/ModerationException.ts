import { CoreError } from './CoreError';

/**
 * Thrown when a message is rejected by moderation or moderation provider failed (fail-close).
 * Must be mapped to HTTP 422.
 */
export class ModerationException extends CoreError {}
