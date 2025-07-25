import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '@use-cases/user';
import {
  InvalidNotifyServiceTokenException,
  DataServiceAbstract,
  User,
  NotifyServiceAbstract,
  UserServiceAbstract,
} from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

jest.mock('sequelize-transactional-decorator', () => ({
  Transactional: () => () => ({}),
  initSequelizeCLS: () => Promise.resolve(),
  SequelizeTransactionalModule: {
    register: () => Promise.resolve(),
  },
}));

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let dataService: DataServiceAbstract;
  let userService: UserServiceAbstract;
  let notifyService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUserUseCase, ...SERVICES_PROVIDER],
    }).compile();

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    notifyService = module.get<NotifyServiceAbstract>(NotifyServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a user with registration token', async () => {
    const createdUser = {
      id: '1',
      name: 'Test',
      registrationToken: 'valid_token',
      authProviderId: 'auth_provider_id',
      coins: 1000000,
      tokenIsInvalid: false,
    };
    const user = new User();
    user.name = 'Test';
    user.registrationToken = 'valid_token';
    user.authProviderId = 'auth_provider_id';

    jest.spyOn(notifyService, 'verifyToken').mockResolvedValue(true);
    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest
      .spyOn(dataService.users, 'create')
      .mockImplementation(async (user) => ({ ...user, id: '1', tokenIsInvalid: false }));

    const result = await createUserUseCase.execute(user);

    expect(result).toEqual(createdUser);
    expect(notifyService.verifyToken).toHaveBeenCalledWith(user.registrationToken);
    expect(dataService.transactional).toHaveBeenCalled();
    expect(dataService.users.create).toHaveBeenCalledWith(user);
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });

  it('should successfully create a user without registration token', async () => {
    const createdUser = {
      id: '1',
      name: 'Test',
      authProviderId: 'auth_provider_id',
      coins: 1000000,
      tokenIsInvalid: true,
    };
    const user = new User();
    user.name = 'Test';
    user.authProviderId = 'auth_provider_id';

    jest.spyOn(notifyService, 'verifyToken').mockResolvedValue(true);
    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
    jest
      .spyOn(dataService.users, 'create')
      .mockImplementation(async (user) => ({ ...user, id: '1', tokenIsInvalid: true }));

    const result = await createUserUseCase.execute(user);

    expect(result).toEqual(createdUser);
    expect(notifyService.verifyToken).not.toHaveBeenCalled();
    expect(dataService.transactional).toHaveBeenCalled();
    expect(dataService.users.create).toHaveBeenCalledWith(user);
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });

  it('should throw InvalidNotifyServiceTokenException when token is invalid', async () => {
    const user = new User();
    user.name = 'Test';
    user.registrationToken = 'invalid_token';

    jest.spyOn(notifyService, 'verifyToken').mockResolvedValue(false);

    await expect(createUserUseCase.execute(user)).rejects.toThrow(InvalidNotifyServiceTokenException);
    expect(notifyService.verifyToken).toHaveBeenCalledWith(user.registrationToken);
    expect(dataService.users.create).not.toHaveBeenCalled();
  });
});
