import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from '@use-cases/user';
import { DataServiceAbstract, User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

jest.mock('sequelize-transactional-decorator', () => ({
  Transactional: () => () => ({}),
  initSequelizeCLS: () => Promise.resolve(),
  SequelizeTransactionalModule: {
    register: () => Promise.resolve(),
  },
}));

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userService: UserServiceAbstract;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateUserUseCase, ...SERVICES_PROVIDER],
    }).compile();

    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  it('should update the current user and return updated user', async () => {
    const newUserData = {
      id: '123',
      name: 'Test_updated',
      incomeMessages: [],
      outcomeMessages: [],
      coins: 0,
      registrationToken: '',
    };
    const currentUser = {
      id: '123',
      name: 'Test',
      incomeMessages: [],
      outcomeMessages: [],
      coins: 0,
      registrationToken: '',
    };

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(currentUser);
    jest.spyOn(dataService.users, 'update').mockImplementation(async (id, user) => ({ ...(user as User), id }));

    const result = await updateUserUseCase.execute(newUserData);

    expect(result).toEqual(newUserData);
    expect(dataService.transactional).toHaveBeenCalled();
    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(dataService.users.update).toHaveBeenCalledWith('123', newUserData);
  });
});
