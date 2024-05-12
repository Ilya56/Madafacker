import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageUseCase } from '@use-cases/message';
import { DataServiceAbstract, Message, MessageMode, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

jest.mock('sequelize-transactional-decorator', () => ({
  Transactional: () => () => ({}),
  initSequelizeCLS: () => Promise.resolve(),
  SequelizeTransactionalModule: {
    register: () => Promise.resolve(),
  },
}));

describe('CreateMessageUseCase', () => {
  let createMessageUseCase: CreateMessageUseCase;
  let dataService: DataServiceAbstract;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateMessageUseCase, ...SERVICES_PROVIDER],
    }).compile();

    createMessageUseCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  it('should successfully create a message', async () => {
    const message = new Message();
    message.body = 'Test message text';
    message.mode = MessageMode.light;

    const user = new User();
    user.name = 'username';

    const createMessage = { id: '1', body: 'Test message text', mode: MessageMode.light, author: user };

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(dataService.messages, 'create').mockImplementation(async (message) => ({ ...message, id: '1' }));

    const result = await createMessageUseCase.execute(message);

    expect(result).toEqual(createMessage);
    expect(dataService.transactional).toHaveBeenCalled();
    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.messages.create).toHaveBeenCalledWith(message);
  });
});
