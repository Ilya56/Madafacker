/**
 * Message mode is used to separate a message with different sense.
 * For example, light messages contain good text with censor, but dark messages are created to say something evil.
 */
export enum MessageMode {
  light = 'light',
  dark = 'dark',
}
