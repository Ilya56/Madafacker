import { Test, TestingModule } from '@nestjs/testing';
import { CreateReplyUseCase } from '@use-cases/reply';
import { NotFoundError, OperationNotAllowedException } from '@core';
import { DataServiceAbstract, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

describe('CreateReplyUseCase', () => {
  let useCase: CreateReplyUseCase;
  let dataService: DataServiceAbstract;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateReplyUseCase, ...SERVICES_PROVIDER],
    }).compile();

    useCase = module.get<CreateReplyUseCase>(CreateReplyUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a reply with the current user and parent message and deduct coins from user', async () => {
    const user = { id: 'user-id', coins: 10 } as any;
    const parentMessage = { id: 'parent-id', mode: 'mode' } as any;
    const reply = { id: 'reply-id', author: null, parent: null, mode: null } as any;

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.messages, 'getById').mockResolvedValue(parentMessage);
    jest.spyOn(dataService.replies, 'create').mockResolvedValue(reply);
    jest.spyOn(dataService.users, 'addCoins').mockResolvedValue(5);

    const input = {
      reply,
      parentId: 'parent-id',
    };

    const result = await useCase.execute(input);

    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.messages.getById).toHaveBeenCalledWith('parent-id');
    expect(dataService.users.addCoins).toHaveBeenCalledWith('user-id', -5);
    expect(dataService.replies.create).toHaveBeenCalledWith(reply);
    expect(result).toBe(reply);
    expect(reply.author).toBe(user);
    expect(reply.parent).toBe(parentMessage);
    expect(reply.mode).toBe(parentMessage.mode);
  });

  it('should throw NotFoundError if parent message is not found', async () => {
    const user = { id: 'user-id' } as any;
    const reply = { id: 'reply-id', author: null, parent: null, mode: null } as any;

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.messages, 'getById').mockResolvedValue(null);

    const input = {
      reply,
      parentId: 'parent-id',
    };

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);

    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.messages.getById).toHaveBeenCalledWith('parent-id');
    expect(dataService.replies.create).not.toHaveBeenCalled();
  });

  it('should throw OperationNotAllowedException if user has insufficient coins', async () => {
    const user = { id: 'user-id', coins: 3 } as any;
    const parentMessage = { id: 'parent-id', mode: 'mode' } as any;
    const reply = { id: 'reply-id', author: null, parent: null, mode: null } as any;

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.messages, 'getById').mockResolvedValue(parentMessage);

    const input = {
      reply,
      parentId: 'parent-id',
    };

    await expect(useCase.execute(input)).rejects.toThrow(OperationNotAllowedException);

    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.messages.getById).toHaveBeenCalledWith('parent-id');
    expect(dataService.users.addCoins).not.toHaveBeenCalled();
    expect(dataService.replies.create).not.toHaveBeenCalled();
  });
});
