import { SequelizeMessageRepository } from '../sequelize-message-repository';
import { MessageModel, SequelizeGenericRepository } from '@frameworks/data-services/sequelize';

describe('SequelizeMessageRepository', () => {
  let repository: SequelizeMessageRepository;
  let superCreateSpy: any;

  beforeEach(() => {
    repository = new SequelizeMessageRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);
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
});
