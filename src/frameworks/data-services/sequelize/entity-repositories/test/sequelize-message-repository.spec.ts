import { SequelizeMessageRepository } from '../sequelize-message-repository';
import { SequelizeGenericRepository } from '@frameworks/data-services/sequelize/sequelize-generic-repository';
import { MessageModel } from '@frameworks/data-services/sequelize/models';

jest.mock('@frameworks/data-services/sequelize', () => {
  const actual = jest.requireActual('@frameworks/data-services/sequelize');
  return {
    ...actual,
    SequelizeGenericRepository: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
    })),
  };
});

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
      authorId: undefined,
    } as unknown as MessageModel;

    await repository.create(message);

    expect(message.authorId).toEqual(message.author.id);
    expect(superCreateSpy).toHaveBeenCalledWith(message);
  });
});
