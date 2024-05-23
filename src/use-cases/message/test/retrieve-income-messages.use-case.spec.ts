import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveIncomeMessagesUseCase } from '@use-cases/message';
import { DataServiceAbstract, Message, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

describe('RetrieveIncomeMessagesUseCase', () => {
  let retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase;
  let dataService: DataServiceAbstract;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetrieveIncomeMessagesUseCase, ...SERVICES_PROVIDER],
    }).compile();

    retrieveIncomeMessagesUseCase = module.get<RetrieveIncomeMessagesUseCase>(RetrieveIncomeMessagesUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  it('should successfully retrieve incoming messages', async () => {
    const user = new User();
    user.id = 'user-id';
    user.name = 'username';

    const messages = [new Message(), new Message()];

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.messages, 'getIncomingByUserId').mockResolvedValue(messages);

    const result = await retrieveIncomeMessagesUseCase.execute();

    expect(result).toEqual(messages);
    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.messages.getIncomingByUserId).toHaveBeenCalledWith(user.id);
  });
});
