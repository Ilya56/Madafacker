import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserUseCase } from '@use-cases/user';
import { User, UserServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

describe('GetUserByIdUseCase', () => {
  let getUserByIdUseCase: GetCurrentUserUseCase;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetCurrentUserUseCase, ...SERVICES_PROVIDER],
    }).compile();

    getUserByIdUseCase = module.get<GetCurrentUserUseCase>(GetCurrentUserUseCase);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  it('should return current user', async () => {
    const user = new User();
    user.name = 'Test';

    jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

    const result = await getUserByIdUseCase.execute({});

    expect(result).toEqual(user);
    expect(userService.getCurrentUser).toHaveBeenCalled();
  });
});
