/**
 * Just a parent class for all entities to have one parent
 */

export abstract class Entity {
  /**
   * Entity unique identifier
   * By default its string because we use uuid in the begining
   */
  id: string;
}
