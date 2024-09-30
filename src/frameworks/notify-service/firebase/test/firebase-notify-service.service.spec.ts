import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseNotifyServiceService } from '../firebase-notify-service.service';
import { ConfigService } from '@nestjs/config';
import { messaging } from 'firebase-admin';

// Mock firebase-admin methods
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn().mockReturnValue({
    messaging: jest.fn().mockReturnValue({
      send: jest.fn(),
    }),
  }),
}));

describe('FirebaseNotifyServiceService', () => {
  let service: FirebaseNotifyServiceService;
  let mockMessaging: jest.Mocked<messaging.Messaging>;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseNotifyServiceService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<FirebaseNotifyServiceService>(FirebaseNotifyServiceService);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mockInitializeApp = require('firebase-admin').initializeApp;
    mockMessaging = mockInitializeApp().messaging();

    jest.clearAllMocks();
  });

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

  it('should throw an error if notify fails', async () => {
    const token = 'mockToken';
    const message = 'Hello World';

    const error = new Error('Failed to send');
    mockMessaging.send.mockRejectedValue(error);

    await expect(service.notify(token, message)).rejects.toThrow('Failed to send');
  });
});
