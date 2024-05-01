export abstract class GenericRepositoryAbstract<T> {
  abstract getAll(): Promise<T[]>;
  abstract getOne(id: string): Promise<T>;
  abstract create(entity: T): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, entity: T): Promise<void>;
}
