import { Test, TestingModule } from '@nestjs/testing';
import { PassportUserServiceService } from '../passport-user-service.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DataServiceAbstract, User, NotFoundError } from '@core';

type UserRequest = Request & { user: User };

describe('PassportUserServiceService', () => {
  let service: PassportUserServiceService;
  let mockRequest: UserRequest;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    // Creating a mock user and attaching it to the request object
    mockRequest = {
      user: {
        id: '1',
        name: 'Test',
        incomeMessages: [],
        outcomeMessages: [],
      } as User,
    } as UserRequest;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportUserServiceService,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
        {
          provide: DataServiceAbstract,
          useValue: {
            messages: {
              getIncomingByUserId: jest.fn().mockResolvedValue(['message1', 'message2']),
            },
          },
        },
      ],
    }).compile();

    service = await module.resolve<PassportUserServiceService>(PassportUserServiceService);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  describe('getCurrentUser', () => {
    it('should return the user from the request object', async () => {
      const result = await service.getCurrentUser();
      expect(result).toEqual(mockRequest.user);
    });

    it('should throw NotFoundError if no user in request object', async () => {
      mockRequest.user = undefined as unknown as User;
      await expect(service.getCurrentUser()).rejects.toThrow(NotFoundError);
    });

    it('should return the user with incoming messages if options.withIncomingMessages is true', async () => {
      const result = await service.getCurrentUser({ withIncomingMessages: true });
      expect(result.incomeMessages).toEqual(['message1', 'message2']);
      expect(dataService.messages.getIncomingByUserId).toHaveBeenCalledWith(mockRequest.user.id);
    });

    it('should return the user without fetching messages if options.withIncomingMessages is false', async () => {
      const result = await service.getCurrentUser({ withIncomingMessages: false });
      expect(result.incomeMessages).toEqual([]);
      expect(dataService.messages.getIncomingByUserId).not.toHaveBeenCalled();
    });
  });
});
