import { SequelizeReplyRepository } from '../sequelize-reply-repository';
import { SequelizeGenericRepository } from '../../sequelize-generic-repository';
import { MessageModel } from '../../models';
import { SequelizeMessageRepository } from '@frameworks/data-services/sequelize/entity-repositories/sequelize-message-repository';

describe('SequelizeReplyRepository', () => {
  let repository: SequelizeReplyRepository;
  let superCreateSpy: jest.SpyInstance;
  let findByPkSpy: jest.SpyInstance;
  let addRepliesToMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeReplyRepository();
    superCreateSpy = jest
      .spyOn(SequelizeGenericRepository.prototype, 'create')
      .mockImplementation(async (model) => model);

    findByPkSpy = jest.spyOn(MessageModel, 'findByPk').mockImplementation(async () => null);
    addRepliesToMessageSpy = jest
      .spyOn(SequelizeMessageRepository.prototype as any, 'addRepliesToMessage')
      .mockImplementation(async (message: MessageModel, depth) => ({
        ...message,
        replies: new Array(depth).fill({ id: message.id + 1, replies: [] }),
      }));
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

  it('should return reply without populated replies if repliesDepth is 0', async () => {
    const replyId = '1';
    const reply = { id: replyId } as unknown as MessageModel;

    findByPkSpy.mockResolvedValue(reply);

    const result = await repository.getByIdWithPopulatedReplies(replyId, 0);

    expect(findByPkSpy).toHaveBeenCalledWith(replyId);
    expect(result).toEqual(reply);
  });

  it('should return reply with populated replies if repliesDepth is greater than 0', async () => {
    const replyId = '1';
    const depth = 2;
    const populatedReply = {
      id: replyId,
      replies: [
        { id: replyId + 1, replies: [] },
        { id: replyId + 1, replies: [] },
      ],
    } as unknown as MessageModel;

    addRepliesToMessageSpy.mockResolvedValue(populatedReply);

    const result = await repository.getByIdWithPopulatedReplies(replyId, depth);

    expect(addRepliesToMessageSpy).toHaveBeenCalledWith({ id: replyId }, depth, true);
    expect(result).toEqual(populatedReply);
  });
});
