import { Test, TestingModule } from '@nestjs/testing';
import { PassportUserServiceService } from '../passport-user-service.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from '@core';

type UserRequest = Request & { user: User };

describe('PassportUserServiceService', () => {
  let service: PassportUserServiceService;
  let mockRequest: UserRequest;

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
      ],
    }).compile();

    service = await module.resolve<PassportUserServiceService>(PassportUserServiceService);
  });

  describe('getCurrentUser', () => {
    it('should return the user from the request object', async () => {
      const result = await service.getCurrentUser();
      expect(result).toEqual(mockRequest.user);
    });
  });
});
