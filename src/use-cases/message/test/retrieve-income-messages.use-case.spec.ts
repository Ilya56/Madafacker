import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveIncomeMessagesUseCase } from '@use-cases/message';
import { Message, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

describe('RetrieveIncomeMessagesUseCase', () => {
  let retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetrieveIncomeMessagesUseCase, ...SERVICES_PROVIDER],
    }).compile();

    retrieveIncomeMessagesUseCase = module.get<RetrieveIncomeMessagesUseCase>(RetrieveIncomeMessagesUseCase);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  it('should successfully retrieve incoming messages', async () => {
    const messages = [new Message(), new Message()];

    const user = new User();
    user.id = 'user-id';
    user.name = 'username';
    user.incomeMessages = messages;

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    const result = await retrieveIncomeMessagesUseCase.execute();

    expect(result).toEqual(messages);
    expect(userService.getCurrentUser).toHaveBeenCalledWith({ withIncomingMessages: true });
  });
});
