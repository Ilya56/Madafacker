import { Test, TestingModule } from '@nestjs/testing';
import { LinearAlgoService } from '../linear-algo.service';
import { DateServiceAbstract, DataServiceAbstract, Message } from '@core';

const TOTAL_USERS_COUNT = 100;

describe('LinearAlgoService', () => {
  let service: LinearAlgoService;
  let dateService: DateServiceAbstract;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const mockDateService = {
      getIntervalDuration: jest.fn(),
      getCurrentDateInMilliseconds: jest.fn(),
    };
    const mockDataService = {
      users: {
        getTotalUsersCount: jest.fn(),
        getUsersAlreadySeeMessageCount: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinearAlgoService,
        { provide: DateServiceAbstract, useValue: mockDateService },
        { provide: DataServiceAbstract, useValue: mockDataService },
      ],
    }).compile();

    service = module.get<LinearAlgoService>(LinearAlgoService);
    dateService = module.get<DateServiceAbstract>(DateServiceAbstract);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);

    jest.spyOn(dateService, 'getIntervalDuration').mockReturnValue(604800000); // 1 week in ms
    jest.spyOn(dataService.users, 'getTotalUsersCount').mockResolvedValue(TOTAL_USERS_COUNT); // 100 total users
  });

  it('should calculate the correct number of users to show the message to after a certain time', async () => {
    const message = new Message();
    message.id = 'msg1';
    message.createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    jest.spyOn(dateService, 'getCurrentDateInMilliseconds').mockReturnValue(Date.now());
    jest.spyOn(dataService.users, 'getUsersAlreadySeeMessageCount').mockResolvedValue(20); // 20 users have seen the message

    const result = await service.selectUsersShowMessage(message);

    expect(result.usersCount).toBe(
      Math.round(((TOTAL_USERS_COUNT * 0.9) / 604800000) * 3 * 24 * 60 * 60 * 1000 + 10) - 20,
    ); // k * timeDiff + startCountToShow
  });

  it('should calculate 10% new users if its first call', async () => {
    const message = new Message();
    message.id = 'msg1';
    message.createdAt = new Date(); // Now

    jest.spyOn(dateService, 'getCurrentDateInMilliseconds').mockReturnValue(message.createdAt.getTime());
    jest.spyOn(dataService.users, 'getUsersAlreadySeeMessageCount').mockResolvedValue(0);

    const result = await service.selectUsersShowMessage(message);

    expect(result.usersCount).toBe(TOTAL_USERS_COUNT * 0.1); // 10%
  });

  it('should calculate zero new users if no time has elapsed', async () => {
    const message = new Message();
    message.id = 'msg1';
    message.createdAt = new Date(); // Now

    jest.spyOn(dateService, 'getCurrentDateInMilliseconds').mockReturnValue(message.createdAt.getTime());
    jest.spyOn(dataService.users, 'getUsersAlreadySeeMessageCount').mockResolvedValue(TOTAL_USERS_COUNT * 0.1);

    const result = await service.selectUsersShowMessage(message);

    expect(result.usersCount).toBe(10 - 10); // No new users should be calculated
  });

  it('should handle cases when more than a week has elapsed', async () => {
    const message = new Message();
    message.id = 'msg1';
    message.createdAt = new Date(Date.now() - 2 * 604800000); // 2 weeks ago

    jest.spyOn(dateService, 'getCurrentDateInMilliseconds').mockReturnValue(Date.now());
    jest.spyOn(dataService.users, 'getUsersAlreadySeeMessageCount').mockResolvedValue(TOTAL_USERS_COUNT);

    const result = await service.selectUsersShowMessage(message);

    expect(result.usersCount).toBe(0); // All users should have seen the message
  });

  it('should return zero if all users have already seen the message', async () => {
    const message = new Message();
    message.id = 'msg1';
    message.createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    jest.spyOn(dateService, 'getCurrentDateInMilliseconds').mockReturnValue(Date.now());
    jest.spyOn(dataService.users, 'getUsersAlreadySeeMessageCount').mockResolvedValue(TOTAL_USERS_COUNT);

    const result = await service.selectUsersShowMessage(message);

    expect(result.usersCount).toBe(100 - 100); // No new users to show
  });

  it('should calculate all users if none have seen the message yet and a week has passed', async () => {
    const message = new Message();
    message.id = 'msg1';
    message.createdAt = new Date(Date.now() - 604800000); // 1 week ago

    jest.spyOn(dateService, 'getCurrentDateInMilliseconds').mockReturnValue(Date.now());
    jest.spyOn(dataService.users, 'getUsersAlreadySeeMessageCount').mockResolvedValue(0);

    const result = await service.selectUsersShowMessage(message);

    expect(result.usersCount).toBe(TOTAL_USERS_COUNT); // All users should be calculated, negative counts due to formula
  });
});
