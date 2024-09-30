import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '@use-cases/user';
import { InvalidNotifyServiceTokenException, DataServiceAbstract, User, NotifyServiceAbstract } from '@core';
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
  let notifyService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUserUseCase, ...SERVICES_PROVIDER],
    }).compile();

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    notifyService = module.get<NotifyServiceAbstract>(NotifyServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a user', async () => {
    const createdUser = { id: '1', name: 'Test', registrationToken: 'valid_token' };
    const user = new User();
    user.name = 'Test';
    user.registrationToken = 'valid_token';

    jest.spyOn(dataService.users, 'create').mockImplementation(async (user) => ({ ...user, id: '1' }));
    jest.spyOn(notifyService, 'verifyToken').mockResolvedValue(true);

    const result = await createUserUseCase.execute(user);

    expect(result).toEqual(createdUser);
    expect(notifyService.verifyToken).toHaveBeenCalledWith(user.registrationToken);
    expect(dataService.transactional).toHaveBeenCalled();
    expect(dataService.users.create).toHaveBeenCalledWith(user);
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
