import { Test, TestingModule } from '@nestjs/testing';
import { DataServiceAbstract, Message, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';
import { RetrieveOutcomeMessagesUseCase } from '@use-cases/message/retrieve-outcome-messages.use-case';

describe('RetrieveOutcomeMessagesUseCase', () => {
  let retrieveOutcomeMessagesUseCase: RetrieveOutcomeMessagesUseCase;
  let userService: UserServiceAbstract;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetrieveOutcomeMessagesUseCase, ...SERVICES_PROVIDER],
    }).compile();

    retrieveOutcomeMessagesUseCase = module.get<RetrieveOutcomeMessagesUseCase>(RetrieveOutcomeMessagesUseCase);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve outcome messages with stats', async () => {
    const message1 = new Message();
    message1.id = 'msg-1';
    const message2 = new Message();
    message2.id = 'msg-2';
    const messages = [message1, message2];

    const user = new User();
    user.id = 'user-id';
    user.name = 'username';
    user.outcomeMessages = messages;

    const stats = {
      'msg-1': { likes: 10, dislikes: 1, superLikes: 2 },
      'msg-2': { likes: 5, dislikes: 0, superLikes: 0 },
    };

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.incomeUserMessage, 'getRatingStatsByMessageIds').mockResolvedValue(stats);

    const result = await retrieveOutcomeMessagesUseCase.execute();

    expect(result).toEqual(messages);
    expect(result[0].ratingStats).toEqual(stats['msg-1']);
    expect(result[1].ratingStats).toEqual(stats['msg-2']);

    expect(userService.getCurrentUser).toHaveBeenCalledWith({ withOutcomingMessages: true });
    expect(dataService.incomeUserMessage.getRatingStatsByMessageIds).toHaveBeenCalledWith(['msg-1', 'msg-2']);
  });

  it('should return empty array if no outcome messages', async () => {
    const user = new User();
    user.id = 'user-id';
    user.outcomeMessages = [];

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    const result = await retrieveOutcomeMessagesUseCase.execute();

    expect(result).toEqual([]);
    expect(dataService.incomeUserMessage.getRatingStatsByMessageIds).not.toHaveBeenCalled();
  });
});
