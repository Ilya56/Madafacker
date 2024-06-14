import { Test, TestingModule } from '@nestjs/testing';
import { GetReplyByIdUseCase } from '@use-cases/reply';
import { DataServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

describe('GetReplyByIdUseCase', () => {
  let useCase: GetReplyByIdUseCase;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetReplyByIdUseCase, ...SERVICES_PROVIDER],
    }).compile();

    useCase = module.get<GetReplyByIdUseCase>(GetReplyByIdUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a reply with the given replyId and populated replies', async () => {
    const replyId = 'reply-id';
    const reply = { id: replyId, replies: [] } as any;

    jest.spyOn(dataService.replies, 'getByIdWithPopulatedReplies').mockResolvedValue(reply);

    const result = await useCase.execute(replyId);

    expect(dataService.replies.getByIdWithPopulatedReplies).toHaveBeenCalledWith(replyId, 1);
    expect(result).toBe(reply);
  });

  it('should return null if the reply is not found', async () => {
    const replyId = 'reply-id';

    jest.spyOn(dataService.replies, 'getByIdWithPopulatedReplies').mockResolvedValue(null);

    const result = await useCase.execute(replyId);

    expect(dataService.replies.getByIdWithPopulatedReplies).toHaveBeenCalledWith(replyId, 1);
    expect(result).toBeNull();
  });
});
