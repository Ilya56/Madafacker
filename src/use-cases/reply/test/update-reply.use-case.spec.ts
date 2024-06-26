import { Test, TestingModule } from '@nestjs/testing';
import { UpdateReplyUseCase } from '@use-cases/reply';
import { DataServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

describe('UpdateReplyUseCase', () => {
  let useCase: UpdateReplyUseCase;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateReplyUseCase, ...SERVICES_PROVIDER],
    }).compile();

    useCase = module.get<UpdateReplyUseCase>(UpdateReplyUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a reply with the given replyId and new reply data', async () => {
    const reply = { id: 'reply-id', public: true } as any;

    jest.spyOn(dataService.replies, 'update').mockResolvedValue(reply);

    const result = await useCase.execute(reply);

    expect(dataService.replies.update).toHaveBeenCalledWith(reply.id, reply);
    expect(result).toBe(reply);
  });

  it('should return null if the reply is not found', async () => {
    const reply = { id: 'reply-id', public: true } as any;

    jest.spyOn(dataService.replies, 'update').mockResolvedValue(null);

    const result = await useCase.execute(reply);

    expect(dataService.replies.update).toHaveBeenCalledWith(reply.id, reply);
    expect(result).toBeNull();
  });
});
