/**
 * This folder is created to store DTO of any object that can be used in the system.
 * Is used as interface between an external world (API) and controllers.
 * Also, it's validation objects that use class-validator to validate input data.
 * For example, entities can have a factory to process DTO in the entity (like string date to a date object, etc.)
 */

export * from './user.dto';
export * from './message.dto';
export * from './reply.dto';
