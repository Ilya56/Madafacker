import { SequelizeMessageRepository } from '../sequelize-message-repository';
import { SequelizeGenericRepository } from '../../sequelize-generic-repository';
import { IncomeUserMessagesModel, MessageModel } from '../../models';
import { Message } from '@core';

describe('SequelizeMessageRepository', () => {
  let repository: SequelizeMessageRepository;
  let superCreateSpy: jest.SpyInstance;
  let findAllSpy: jest.SpyInstance;
  let findAllMessageSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeMessageRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);

    findAllSpy = jest.spyOn(IncomeUserMessagesModel, 'findAll').mockImplementation(async () => []);
    findAllMessageSpy = jest.spyOn(MessageModel, 'findAll').mockImplementation(async () => []);
    updateSpy = jest.spyOn(repository, 'update').mockImplementation(async () => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set authorId and call super.create with the modified message', async () => {
    const message = {
      author: { id: 123 },
    } as unknown as MessageModel;

    await repository.create(message);

    expect(message.authorId).toEqual(message.author.id);
    expect(superCreateSpy).toHaveBeenCalledWith(message);
  });

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
      },
    });
    expect(result).toEqual(messages);
  });

  it('should mark a message as sent', async () => {
    const message = {
      id: 1,
      text: 'Message 1',
      wasSent: false,
    } as unknown as Message;

    const messageModel = { ...message, wasSent: true } as MessageModel;

    await repository.markAsSent(message);

    expect(updateSpy).toHaveBeenCalledWith(message.id, messageModel);
  });
});
