/**
 * This folder contains basic abstract classes, that can be used by use cases, and implemented in the last layer.
 * For example, it's database communication.
 * It's just an abstraction that guarantees that all will work well, but
 * which DB is used, how it's working, etc. all of its details
 */

export * from './algo-service.abstract';
export * from './entity-repositories';
export * from './data-service.abstract';
export * from './date-service.abstract';
export * from './generic-repository.abstract';
export * from './user-service.abstract';
export * from './task-service';
