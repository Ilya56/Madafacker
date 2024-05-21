import { SequelizeMessageRepository } from '../sequelize-message-repository';
import { MessageModel, IncomeUserMessagesModel, SequelizeGenericRepository } from '@frameworks/data-services/sequelize';

describe('SequelizeMessageRepository', () => {
  let repository: SequelizeMessageRepository;
  let superCreateSpy: jest.SpyInstance;
  let findAllSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeMessageRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);

    findAllSpy = jest.spyOn(IncomeUserMessagesModel, 'findAll').mockImplementation(async () => []);
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
});
