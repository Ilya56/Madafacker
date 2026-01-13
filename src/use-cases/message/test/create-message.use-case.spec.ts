import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageUseCase } from '@use-cases/message';
import {
  DataServiceAbstract,
  Message,
  MessageMode,
  ModerationException,
  ModerationServiceAbstract,
  TaskServiceAbstract,
  User,
  UserServiceAbstract,
} from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';
import { ConfigService } from '@nestjs/config';

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
  let moderationService: ModerationServiceAbstract;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateMessageUseCase, ...SERVICES_PROVIDER],
    }).compile();

    createMessageUseCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
    taskService = module.get<TaskServiceAbstract>(TaskServiceAbstract);
    moderationService = module.get<ModerationServiceAbstract>(ModerationServiceAbstract);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();

    // Reasonable defaults for new tests
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'moderation.thresholdLight') return 0.01;
      if (key === 'moderation.thresholdDark') return 0.4;
      return undefined;
    });
  });

  it('should successfully create a message', async () => {
    const message = new Message();
    message.body = 'Test message text';
    message.mode = MessageMode.light;

    const user = new User();
    user.name = 'username';

    const createdMessage = { id: '1', body: message.body, mode: message.mode } as Message;

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(moderationService, 'moderate').mockResolvedValue({ flagged: false, categoryScores: { hate: 0 } });
    jest.spyOn(dataService.messages, 'create').mockResolvedValue(createdMessage);
    jest.spyOn(taskService.sendMessage, 'addTask').mockImplementation();

    const result = await createMessageUseCase.execute(message);

    expect(result).toEqual({ ...createdMessage, author: user });
    expect(dataService.transactional).toHaveBeenCalled();
    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(moderationService.moderate).toHaveBeenCalledWith(message.body);
    expect(dataService.messages.create).toHaveBeenCalledWith(message);
    expect(taskService.sendMessage.addTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: createdMessage.id, body: createdMessage.body, mode: createdMessage.mode }),
    );
  });

  it('should moderate BEFORE creating message and enqueue AFTER creating message', async () => {
    const message = new Message();
    message.body = 'Test message text';
    message.mode = MessageMode.dark;

    const user = new User();
    user.name = 'username';

    const calls: string[] = [];

    jest.spyOn(userService, 'getCurrentUser').mockImplementation(async () => {
      calls.push('getCurrentUser');
      return user;
    });

    jest.spyOn(moderationService, 'moderate').mockImplementation(async () => {
      calls.push('moderate');
      return { flagged: false, categoryScores: { violence: 0 } };
    });

    jest.spyOn(dataService.messages, 'create').mockImplementation(async (m) => {
      calls.push('create');
      return { ...m, id: '1' };
    });

    jest.spyOn(taskService.sendMessage, 'addTask').mockImplementation(async () => {
      calls.push('addTask');
    });

    await createMessageUseCase.execute(message);

    expect(calls).toEqual(['getCurrentUser', 'moderate', 'create', 'addTask']);
  });

  it('should reject in light mode when ANY score > thresholdLight and NOT create/enqueue', async () => {
    const message = new Message();
    message.body = 'Test message text';
    message.mode = MessageMode.light;

    const user = new User();
    user.name = 'username';

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'moderation.thresholdLight') return 0.01;
      if (key === 'moderation.thresholdDark') return 0.4;
      return undefined;
    });

    jest.spyOn(moderationService, 'moderate').mockResolvedValue({
      flagged: false,
      categoryScores: { hate: 0.02 }, // exceeds 0.01
    });

    const createSpy = jest.spyOn(dataService.messages, 'create');
    const addTaskSpy = jest.spyOn(taskService.sendMessage, 'addTask');

    await expect(createMessageUseCase.execute(message)).rejects.toThrow(ModerationException);

    expect(createSpy).not.toHaveBeenCalled();
    expect(addTaskSpy).not.toHaveBeenCalled();
  });

  it('should allow in dark mode when flagged=true but all scores <= thresholdDark', async () => {
    const message = new Message();
    message.body = 'Test message text';
    message.mode = MessageMode.dark;

    const user = new User();
    user.name = 'username';

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'moderation.thresholdLight') return 0.01;
      if (key === 'moderation.thresholdDark') return 0.4;
      return undefined;
    });

    jest.spyOn(moderationService, 'moderate').mockResolvedValue({
      flagged: true,
      categoryScores: { violence: 0.4 }, // equals threshold -> allowed
    });

    jest.spyOn(dataService.messages, 'create').mockImplementation(async (m) => ({ ...m, id: '1' }));
    jest.spyOn(taskService.sendMessage, 'addTask').mockImplementation();

    await expect(createMessageUseCase.execute(message)).resolves.toMatchObject({ id: '1' });

    expect(dataService.messages.create).toHaveBeenCalled();
    expect(taskService.sendMessage.addTask).toHaveBeenCalled();
  });

  it('should return error if moderation service is not available', async () => {
    const message = new Message();
    message.body = 'Test message text';
    message.mode = MessageMode.dark;

    const user = new User();
    user.name = 'username';

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'moderation.thresholdLight') return 0.01;
      if (key === 'moderation.thresholdDark') return 0.4;
      return undefined;
    });

    jest.spyOn(moderationService, 'moderate').mockRejectedValue({
      error: true,
    });

    jest.spyOn(dataService.messages, 'create').mockImplementation(async (m) => ({ ...m, id: '1' }));
    jest.spyOn(taskService.sendMessage, 'addTask').mockImplementation();

    await expect(createMessageUseCase.execute(message)).rejects.toMatchObject({
      message: 'Message moderation failed. Please try again later.',
    });

    expect(dataService.messages.create).not.toHaveBeenCalled();
    expect(taskService.sendMessage.addTask).not.toHaveBeenCalled();
  });
});
