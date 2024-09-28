import { Test, TestingModule } from '@nestjs/testing';
import { PassportUserServiceService } from '../passport-user-service.service';
import { ClsService } from 'nestjs-cls';
import { DataServiceAbstract, User, NotFoundError } from '@core';
import { ClsData } from '@controllers';

describe('PassportUserServiceService', () => {
  let service: PassportUserServiceService;
  let clsService: ClsService<ClsData>;
  let dataService: DataServiceAbstract;
  let mockUser: User;

  beforeEach(async () => {
    // Mock user data
    mockUser = {
      id: '1',
      name: 'Test User',
      incomeMessages: [],
      outcomeMessages: [],
      coins: 0,
      registrationToken: '',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportUserServiceService,
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue(mockUser),
          },
        },
        {
          provide: DataServiceAbstract,
          useValue: {
            users: {
              lock: jest.fn().mockResolvedValue(mockUser),
            },
            messages: {
              getIncomingByUserId: jest.fn().mockResolvedValue(['message1', 'message2']),
              getOutcomingByUserId: jest.fn().mockResolvedValue(['message3', 'message4']),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PassportUserServiceService>(PassportUserServiceService);
    clsService = module.get<ClsService<ClsData>>(ClsService);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    describe('General Behavior', () => {
      it('should return the user from ClsService', async () => {
        const result = await service.getCurrentUser();
        expect(result).toEqual(mockUser);
      });

      it('should throw NotFoundError if no user in ClsService', async () => {
        jest.spyOn(clsService, 'get').mockReturnValueOnce(undefined);
        await expect(service.getCurrentUser()).rejects.toThrow(NotFoundError);
      });
    });

    describe('Message Fetching', () => {
      it('should return the user with incoming messages if options.withIncomingMessages is true', async () => {
        const result = await service.getCurrentUser({ withIncomingMessages: true });
        expect(result.incomeMessages).toEqual(['message1', 'message2']);
        expect(dataService.messages.getIncomingByUserId).toHaveBeenCalledWith(mockUser.id, 1);
      });

      it('should not fetch incoming messages if options.withIncomingMessages is false', async () => {
        const result = await service.getCurrentUser({ withIncomingMessages: false });
        expect(result.incomeMessages).toEqual([]);
        expect(dataService.messages.getIncomingByUserId).not.toHaveBeenCalled();
      });

      it('should return the user with outcoming messages if options.withOutcomingMessages is true', async () => {
        const result = await service.getCurrentUser({ withOutcomingMessages: true });
        expect(result.outcomeMessages).toEqual(['message3', 'message4']);
        expect(dataService.messages.getOutcomingByUserId).toHaveBeenCalledWith(mockUser.id, 1);
      });

      it('should not fetch outcoming messages if options.withOutcomingMessages is false', async () => {
        const result = await service.getCurrentUser({ withOutcomingMessages: false });
        expect(result.outcomeMessages).toEqual([]);
        expect(dataService.messages.getOutcomingByUserId).not.toHaveBeenCalled();
      });
    });

    describe('Locking Behavior', () => {
      it('should lock the user if options.lock is true', async () => {
        await service.getCurrentUser({ lock: true });
        expect(dataService.users.lock).toHaveBeenCalledWith(mockUser.id);
      });

      it('should not lock the user if options.lock is false', async () => {
        await service.getCurrentUser({ lock: false });
        expect(dataService.users.lock).not.toHaveBeenCalled();
      });

      it('should not lock the user if options.lock is not provided', async () => {
        await service.getCurrentUser();
        expect(dataService.users.lock).not.toHaveBeenCalled();
      });
    });
  });
});
