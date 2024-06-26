import { Test, TestingModule } from '@nestjs/testing';
import { Message, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';
import { RetrieveOutcomeMessagesUseCase } from '@use-cases/message/retrieve-outcome-messages.use-case';

describe('RetrieveIncomeMessagesUseCase', () => {
  let retrieveOutcomeMessagesUseCase: RetrieveOutcomeMessagesUseCase;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetrieveOutcomeMessagesUseCase, ...SERVICES_PROVIDER],
    }).compile();

    retrieveOutcomeMessagesUseCase = module.get<RetrieveOutcomeMessagesUseCase>(RetrieveOutcomeMessagesUseCase);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  it('should successfully retrieve incoming messages', async () => {
    const messages = [new Message(), new Message()];

    const user = new User();
    user.id = 'user-id';
    user.name = 'username';
    user.outcomeMessages = messages;

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    const result = await retrieveOutcomeMessagesUseCase.execute();

    expect(result).toEqual(messages);
    expect(userService.getCurrentUser).toHaveBeenCalledWith({ withOutcomingMessages: true });
  });
});
