import { SequelizeGenericRepository } from '../../sequelize-generic-repository';
import { Sequelize, Model, ModelCtor } from 'sequelize-typescript';
import { DuplicateNotAllowedError } from '@core';

jest.mock('sequelize-typescript');

// Mock Model for use in tests
class TestModel extends Model {}
TestModel.init({}, { sequelize: new Sequelize() });

describe('SequelizeGenericRepository', () => {
  let repository: ModelCtor<TestModel>;
  let sequelizeGenericRepository: SequelizeGenericRepository<TestModel, ModelCtor<TestModel>>;

  beforeEach(() => {
    // Set up the repository mock
    repository = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn(),
      update: jest.fn(),
    } as any;

    // Initialize the repository with the mocked ModelCtor
    sequelizeGenericRepository = new SequelizeGenericRepository<TestModel, ModelCtor<TestModel>>(repository);
  });

  describe('getAll', () => {
    it('should retrieve all entities', async () => {
      const expectedModels = [new TestModel(), new TestModel()];
      jest.spyOn(repository, 'findAll').mockResolvedValue(expectedModels);

      const result = await sequelizeGenericRepository.getAll();
      expect(result).toEqual(expectedModels);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should retrieve a single entity by id', async () => {
      const expectedModel = new TestModel();
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedModel);

      const result = await sequelizeGenericRepository.getById(1);
      expect(result).toEqual(expectedModel);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const newModel = new TestModel();
      jest.spyOn(repository, 'create').mockResolvedValue(newModel);

      const result = await sequelizeGenericRepository.create(newModel);
      expect(result).toEqual(newModel);
      expect(repository.create).toHaveBeenCalledWith(newModel);
    });

    it('should throw DuplicateNotAllowedError on unique constraint violation', async () => {
      const newModel = new TestModel();
      const error = new Error();
      error.name = 'SequelizeUniqueConstraintError';
      jest.spyOn(repository, 'create').mockRejectedValue(error);

      await expect(sequelizeGenericRepository.create(newModel)).rejects.toThrow(DuplicateNotAllowedError);
      expect(repository.create).toHaveBeenCalledWith(newModel as any);
    });

    it('should rethrow other errors', async () => {
      const newModel = new TestModel();
      const error = new Error('Some other error');
      jest.spyOn(repository, 'create').mockRejectedValue(error);

      await expect(sequelizeGenericRepository.create(newModel)).rejects.toThrow('Some other error');
      expect(repository.create).toHaveBeenCalledWith(newModel as any);
    });
  });

  describe('delete', () => {
    it('should delete an entity by id', async () => {
      jest.spyOn(repository, 'destroy').mockResolvedValue(1);

      await sequelizeGenericRepository.delete(1);
      expect(repository.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update an entity and return the updated entity', async () => {
      const updatedModel = new TestModel();
      // because sequelize has two update functions, it creates an issue that here should be only one return item,
      //  but the function is used with returning: true, so here should be 2 items
      const mockUpdateResult: [number] = [1, [updatedModel]] as never as [number];

      jest.spyOn(repository, 'update').mockResolvedValue(mockUpdateResult);

      const result = await sequelizeGenericRepository.update(1, updatedModel);
      expect(result).toEqual(updatedModel);
      expect(repository.update).toHaveBeenCalledWith(updatedModel, { where: { id: 1 }, returning: true });
    });

    it('should return null if no entity is updated', async () => {
      const updatedModel = new TestModel();
      const mockUpdateResult = [0, []] as never as [number];

      jest.spyOn(repository, 'update').mockResolvedValue(mockUpdateResult);

      const result = await sequelizeGenericRepository.update(1, updatedModel);
      expect(result).toBeNull();
      expect(repository.update).toHaveBeenCalledWith(updatedModel, { where: { id: 1 }, returning: true });
    });
  });

  describe('lock', () => {
    it('should lock an entity by id and return the locked entity', async () => {
      const lockedModel = new TestModel();
      jest.spyOn(repository, 'findOne').mockResolvedValue(lockedModel);

      const result = await sequelizeGenericRepository.lock(1);
      expect(result).toEqual(lockedModel);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, lock: true });
    });

    it('should return null if the entity is not found during lock', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await sequelizeGenericRepository.lock(1);
      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, lock: true });
    });
  });
});
