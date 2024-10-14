import { SequelizeMessageRepository } from '../sequelize-message-repository';
import { SequelizeGenericRepository } from '../../sequelize-generic-repository';
import { IncomeUserMessagesModel, MessageModel, UserModel } from '../../models';
import { GetByIdOptions } from '@core';

describe('SequelizeMessageRepository', () => {
  let repository: SequelizeMessageRepository;
  let superCreateSpy: jest.SpyInstance;
  let findAllSpy: jest.SpyInstance;
  let findAllMessageSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;
  let superGetByIdSpy: jest.SpyInstance;
  let findOneSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeMessageRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);

    findAllSpy = jest.spyOn(IncomeUserMessagesModel, 'findAll').mockImplementation(async () => []);
    findAllMessageSpy = jest.spyOn(MessageModel, 'findAll').mockImplementation(async () => []);
    updateSpy = jest.spyOn(repository, 'update').mockImplementation(async () => null);

    superGetByIdSpy = jest.spyOn(SequelizeGenericRepository.prototype, 'getById').mockImplementation(async (id) => {
      return { id } as MessageModel;
    });

    findOneSpy = jest.spyOn(MessageModel, 'findOne').mockImplementation(async () => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should set authorId and call super.create with the modified message', async () => {
      const message = {
        author: { id: 123 },
      } as unknown as MessageModel;

      await repository.create(message);

      expect(message.authorId).toEqual(message.author.id);
      expect(superCreateSpy).toHaveBeenCalledWith(message);
    });
  });

  describe('getIncomingByUserId', () => {
    it('should retrieve incoming messages for a given user ID', async () => {
      const userId = 'test-user-id';
      const messages = [
        { id: 1, text: 'Message 1' },
        { id: 2, text: 'Message 2' },
      ] as unknown as MessageModel[];

      const incomeUserMessagesModels = messages.map((message) => ({
        message,
      })) as any;

      findAllSpy.mockResolvedValue(incomeUserMessagesModels);

      const result = await repository.getIncomingByUserId(userId);

      expect(findAllSpy).toHaveBeenCalledWith({
        where: { userId },
        include: { model: MessageModel },
      });
      expect(result).toEqual(messages);
    });
  });

  describe('getOutcomingByUserId', () => {
    it('should retrieve outgoing messages for a given user ID', async () => {
      const userId = 'test-user-id';
      const messages = [
        { id: 1, text: 'Outgoing Message 1', authorId: userId },
        { id: 2, text: 'Outgoing Message 2', authorId: userId },
      ] as unknown as MessageModel[];

      findAllMessageSpy.mockResolvedValue(messages);

      const result = await repository.getOutcomingByUserId(userId);

      expect(findAllMessageSpy).toHaveBeenCalledWith({
        where: {
          authorId: userId,
        },
      });
      expect(result).toEqual(messages);
    });
  });

  describe('generateInclude', () => {
    it('should generate include options with specified depth', () => {
      const depth = 2;
      const includeOptions = repository['generateInclude'](depth);

      expect(includeOptions).toEqual([
        {
          model: MessageModel,
          as: 'replies',
          include: [
            {
              model: MessageModel,
              as: 'replies',
            },
          ],
        },
      ]);
    });

    it('should generate include options with depth 0', () => {
      const depth = 0;
      const includeOptions = repository['generateInclude'](depth);

      expect(includeOptions).toBeUndefined();
    });
  });

  describe('getNotSentMessages', () => {
    it('should retrieve all messages with wasSent = false', async () => {
      const messages = [
        { id: 1, text: 'Message 1', wasSent: false },
        { id: 2, text: 'Message 2', wasSent: false },
      ] as unknown as MessageModel[];

      findAllMessageSpy.mockResolvedValue(messages);

      const result = await repository.getNotSentMessages();

      expect(findAllMessageSpy).toHaveBeenCalledWith({
        where: {
          wasSent: false,
          parentId: null,
        },
      });
      expect(result).toEqual(messages);
    });
  });

  describe('markAsSent', () => {
    it('should mark a message as sent', async () => {
      const messageId = '1';

      await repository.markAsSent(messageId);

      expect(updateSpy).toHaveBeenCalledWith(messageId, { wasSent: true });
    });
  });

  describe('getById', () => {
    it('should retrieve message by id without including author when withAuthor is false or undefined', async () => {
      const messageId = 'test-message-id';
      const result = await repository.getById(messageId);

      expect(superGetByIdSpy).toHaveBeenCalledWith(messageId);
      expect(findOneSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ id: messageId });
    });

    it('should retrieve message by id and include author when withAuthor is true', async () => {
      const messageId = 'test-message-id';
      const messageWithAuthor = { id: messageId, author: { id: 'author-id' } } as MessageModel;

      findOneSpy.mockResolvedValue(messageWithAuthor);

      const options: GetByIdOptions = { withAuthor: true };
      const result = await repository.getById(messageId, options);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: messageId },
        include: UserModel,
      });
      expect(result).toEqual(messageWithAuthor);
    });

    it('should return null if no message is found when withAuthor is true', async () => {
      const messageId = 'non-existent-message-id';

      findOneSpy.mockResolvedValue(null);

      const options: GetByIdOptions = { withAuthor: true };
      const result = await repository.getById(messageId, options);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: messageId },
        include: UserModel,
      });
      expect(result).toBeNull();
    });
  });
});
