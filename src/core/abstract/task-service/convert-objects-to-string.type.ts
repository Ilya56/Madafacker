import { MessageMode } from '@core';

/**
 * This type converts all dates to the strings. It's required in case of usage Bull or any other message broker.
 * This is because they can send only a string type and any object like Date will be stringified.
 * You can extend this type if you send any new object that is stringified by JSON.stringify inside Bull
 */
export type ConvertObjectsToStringType<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends MessageMode
    ? string
    : T[K] extends object
    ? ConvertObjectsToStringType<T[K]>
    : T[K];
};
