import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataServiceAbstract, User } from '@core';
import { FirebasePassportStrategy } from '../firebase.passport-strategy';
import { ClsService } from 'nestjs-cls';
import { FIREBASE_AUTH } from '@frameworks/firebase-module';
import { ClsData } from '@controllers';

const mockAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'auth_provider_id' }),
};

describe('FirebasePassportStrategy', () => {
  let strategy: FirebasePassportStrategy;
  let dataService: DataServiceAbstract;
  let cls: ClsService<ClsData>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebasePassportStrategy,
        {
          provide: DataServiceAbstract,
          useValue: {
            users: {
              getByAuthProviderId: jest.fn(),
            },
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
          },
        },
        { provide: FIREBASE_AUTH, useValue: mockAuth },
      ],
    }).compile();

    strategy = module.get<FirebasePassportStrategy>(FirebasePassportStrategy);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    cls = module.get<ClsService<ClsData>>(ClsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockAuth.verifyIdToken.mockClear();
  });

  describe('validate', () => {
    it('should return the user object when token is valid and the user is found', async () => {
      const user = new User();
      user.id = '1';
      user.name = 'testuser';
      user.authProviderId = 'auth_provider_id';
      jest.spyOn(dataService.users, 'getByAuthProviderId').mockResolvedValue(user);

      const result = await strategy.validate('valid_token');
      expect(result).toEqual(user);
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid_token', true);
      expect(dataService.users.getByAuthProviderId).toHaveBeenCalledWith('auth_provider_id');
    });

    it('should throw an NotFoundException when token is valid and the user is not found', async () => {
      jest.spyOn(dataService.users, 'getByAuthProviderId').mockResolvedValue(null);

      await expect(strategy.validate('valid_token')).rejects.toThrow(NotFoundException);
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid_token', true);
      expect(dataService.users.getByAuthProviderId).toHaveBeenCalledWith('auth_provider_id');
    });

    it('should return object with uid in case of registration', async () => {
      jest.spyOn(dataService.users, 'getByAuthProviderId').mockResolvedValue(null);
      jest.spyOn(cls, 'get').mockResolvedValue(true as never);

      const result = await strategy.validate('valid_token');
      expect(result).toEqual({ authProviderId: 'auth_provider_id' });
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid_token', true);
      expect(dataService.users.getByAuthProviderId).not.toHaveBeenCalled();
    });

    it("should return null if it's firebase error", async () => {
      const error = new Error('FirebaseError') as any;
      error.errorInfo = { code: 'some-code' };

      jest.spyOn(mockAuth, 'verifyIdToken').mockRejectedValue(error);

      const result = await strategy.validate('invalid_toke');
      expect(result).toBeNull();
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('invalid_toke', true);
    });
  });
});
