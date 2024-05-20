import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageUseCase } from '@use-cases/message';
import { DataServiceAbstract, Message, MessageMode, TaskServiceAbstract, User, UserServiceAbstract } from '@core';
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
  let taskService: TaskServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateMessageUseCase, ...SERVICES_PROVIDER],
    }).compile();

    createMessageUseCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
    taskService = module.get<TaskServiceAbstract>(TaskServiceAbstract);
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
    jest.spyOn(taskService.sendMessage, 'addTask').mockImplementation();

    const result = await createMessageUseCase.execute(message);

    expect(result).toEqual(createMessage);
    expect(dataService.transactional).toHaveBeenCalled();
    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.messages.create).toHaveBeenCalledWith(message);
    expect(taskService.sendMessage.addTask).toHaveBeenCalledWith({ ...message, id: '1' });
  });
});
