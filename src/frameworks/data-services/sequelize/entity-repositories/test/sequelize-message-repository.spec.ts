import { SequelizeMessageRepository } from '../sequelize-message-repository';
import { SequelizeGenericRepository } from '../../sequelize-generic-repository';
import { IncomeUserMessagesModel, MessageModel } from '../../models';

describe('SequelizeMessageRepository', () => {
  let repository: SequelizeMessageRepository;
  let superCreateSpy: jest.SpyInstance;
  let findAllSpy: jest.SpyInstance;
  let findAllMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeMessageRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);

    findAllSpy = jest.spyOn(IncomeUserMessagesModel, 'findAll').mockImplementation(async () => []);
    findAllMessageSpy = jest.spyOn(MessageModel, 'findAll').mockImplementation(async () => []);
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
      include: MessageModel,
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
});
