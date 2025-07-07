import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseNotifyServiceService } from '../firebase-notify-service.service';
import { ConfigService } from '@nestjs/config';
import { InvalidNotifyServiceTokenException, TokenExpiredException } from '@core';
import { ErrorCodes } from '@frameworks/notify-service/firebase/error-codes.enum';
import { FIREBASE_MESSAGING } from '@frameworks/firebase-module';

const mockMessaging = {
  send: jest.fn(),
};

describe('FirebaseNotifyServiceService', () => {
  let service: FirebaseNotifyServiceService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      isFirebaseEnabled: true,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseNotifyServiceService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: FIREBASE_MESSAGING, useValue: mockMessaging },
      ],
    }).compile();

    service = module.get<FirebaseNotifyServiceService>(FirebaseNotifyServiceService);

    jest.clearAllMocks();
  });

  describe('notify', () => {
    it('should call fcm.send with the correct parameters', async () => {
      const token = 'mockToken';
      const message = 'Hello World';

      mockMessaging.send.mockResolvedValue('messageId');

      await service.notify(token, message);

      expect(mockMessaging.send).toHaveBeenCalledWith({
        token,
        data: { message },
        notification: { title: message },
      });
    });

    it('should throw InvalidNotifyServiceTokenException for invalid token error', async () => {
      const token = 'mockToken';
      const message = 'Hello World';
      const error = { code: ErrorCodes.INVALID_TOKEN_ERROR_CODE };

      mockMessaging.send.mockRejectedValue(error);

      await expect(service.notify(token, message)).rejects.toThrow(InvalidNotifyServiceTokenException);
    });

    it('should throw TokenExpiredException for token not registered error', async () => {
      const token = 'mockToken';
      const message = 'Hello World';
      const error = { code: ErrorCodes.TOKEN_NOT_REGISTERED_ERROR_CODE };

      mockMessaging.send.mockRejectedValue(error);

      await expect(service.notify(token, message)).rejects.toThrow(TokenExpiredException);
    });

    it('should rethrow any other error from fcm.send', async () => {
      const token = 'mockToken';
      const message = 'Hello World';
      const error = new Error('Unknown error');

      mockMessaging.send.mockRejectedValue(error);

      await expect(service.notify(token, message)).rejects.toThrow('Unknown error');
    });
  });

  describe('verifyToken', () => {
    it('should return true if token is valid', async () => {
      const token = 'mockToken';

      mockMessaging.send.mockResolvedValue('messageId');

      const result = await service.verifyToken(token);

      expect(result).toBe(true);
      expect(mockMessaging.send).toHaveBeenCalledWith({ token }, true);
    });

    it('should return false if token is invalid', async () => {
      const token = 'mockToken';
      const error = new Error('Token is invalid');

      mockMessaging.send.mockRejectedValue(error);

      const result = await service.verifyToken(token);

      expect(result).toBe(false);
    });
  });
});
