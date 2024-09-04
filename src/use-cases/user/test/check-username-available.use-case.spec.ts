import { Test, TestingModule } from '@nestjs/testing';
import { CheckUsernameAvailableUseCase } from '@use-cases/user';
import { DataServiceAbstract, User } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

describe('CheckUsernameAvailableUseCase', () => {
  let checkUsernameAvailableUseCase: CheckUsernameAvailableUseCase;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckUsernameAvailableUseCase, ...SERVICES_PROVIDER],
    }).compile();

    checkUsernameAvailableUseCase = module.get<CheckUsernameAvailableUseCase>(CheckUsernameAvailableUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  it('should return true if the username is available', async () => {
    const mockName = 'availableUsername';

    // Mocking that no user is found with the given name
    jest.spyOn(dataService.users, 'getByName').mockResolvedValue(null);

    const result = await checkUsernameAvailableUseCase.execute(mockName);

    expect(result).toBe(true);
    expect(dataService.users.getByName).toHaveBeenCalledWith(mockName);
  });

  it('should return false if the username is already taken', async () => {
    const mockName = 'takenUsername';
    const mockUser = { id: '1', name: 'takenUsername' } as User;

    // Mocking that a user is found with the given name
    jest.spyOn(dataService.users, 'getByName').mockResolvedValue(mockUser);

    const result = await checkUsernameAvailableUseCase.execute(mockName);

    expect(result).toBe(false);
    expect(dataService.users.getByName).toHaveBeenCalledWith(mockName);
  });
});
