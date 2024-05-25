import { SequelizeReplyRepository } from '../sequelize-reply-repository';
import { SequelizeGenericRepository } from '../../sequelize-generic-repository';
import { MessageModel } from '../../models';

describe('SequelizeReplyRepository', () => {
  let repository: SequelizeReplyRepository;
  let superCreateSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeReplyRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set authorId and parentId and call super.create with the modified reply', async () => {
    const reply = {
      author: { id: 123 },
      parent: { id: 456 },
    } as unknown as MessageModel;

    await repository.create(reply);

    expect(reply.authorId).toEqual(reply.author.id);
    expect(reply.parentId).toEqual(reply.parent.id);
    expect(superCreateSpy).toHaveBeenCalledWith(reply);
  });
});
