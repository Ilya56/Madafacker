import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveIncomeMessagesUseCase } from '@use-cases/message';
import { DataServiceAbstract, Message, MessageRating, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

describe('RetrieveIncomeMessagesUseCase', () => {
  let retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase;
  let userService: UserServiceAbstract;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetrieveIncomeMessagesUseCase, ...SERVICES_PROVIDER],
    }).compile();

    retrieveIncomeMessagesUseCase = module.get<RetrieveIncomeMessagesUseCase>(RetrieveIncomeMessagesUseCase);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve incoming messages with stats and own rating', async () => {
    const message1 = new Message();
    message1.id = 'msg-1';
    const message2 = new Message();
    message2.id = 'msg-2';
    const messages = [message1, message2];

    const user = new User();
    user.id = 'user-id';
    user.name = 'username';
    user.incomeMessages = messages;

    const stats = {
      'msg-1': { likes: 10, dislikes: 1, superLikes: 2 },
      'msg-2': { likes: 5, dislikes: 0, superLikes: 0 },
    };
    const ownRatings = {
      'msg-1': MessageRating.like,
    };

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.incomeUserMessage, 'getRatingStatsByMessageIds').mockResolvedValue(stats);
    jest.spyOn(dataService.incomeUserMessage, 'getUserRatingsByMessageIds').mockResolvedValue(ownRatings);

    const result = await retrieveIncomeMessagesUseCase.execute();

    expect(result).toEqual(messages);
    expect(result[0].ratingStats).toEqual(stats['msg-1']);
    expect(result[0].ownRating).toEqual(ownRatings['msg-1']);
    expect(result[1].ratingStats).toEqual(stats['msg-2']);
    expect(result[1].ownRating).toBeUndefined();

    expect(userService.getCurrentUser).toHaveBeenCalledWith({ withIncomingMessages: true });
    expect(dataService.incomeUserMessage.getRatingStatsByMessageIds).toHaveBeenCalledWith(['msg-1', 'msg-2']);
    expect(dataService.incomeUserMessage.getUserRatingsByMessageIds).toHaveBeenCalledWith(user.id, ['msg-1', 'msg-2']);
  });

  it('should return empty array if no incoming messages', async () => {
    const user = new User();
    user.id = 'user-id';
    user.incomeMessages = [];

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    const result = await retrieveIncomeMessagesUseCase.execute();

    expect(result).toEqual([]);
    expect(dataService.incomeUserMessage.getRatingStatsByMessageIds).not.toHaveBeenCalled();
  });
});
