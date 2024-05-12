import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '@use-cases/user';
import { DataServiceAbstract, User } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUserUseCase, ...SERVICES_PROVIDER],
    }).compile();

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  it('should successfully create a user', async () => {
    const createdUser = { id: '1', name: 'Test' };
    const user = new User();
    user.name = 'Test';

    jest.spyOn(dataService.users, 'create').mockImplementation(async (user) => ({ ...user, id: '1' }));

    const result = await createUserUseCase.execute(user);

    expect(result).toEqual(createdUser);
    expect(dataService.transactional).toHaveBeenCalled();
    expect(dataService.users.create).toHaveBeenCalledWith(user);
  });
});
