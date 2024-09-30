import { Test, TestingModule } from '@nestjs/testing';
import { SendMessageUseCase } from '@use-cases/message';
import { AlgoServiceAbstract, DataServiceAbstract, Message, MessageMode, NotifyServiceAbstract, User } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';
import { Logger } from '@nestjs/common';

describe('SendMessageUseCase', () => {
  let service: SendMessageUseCase;
  let algoService: AlgoServiceAbstract;
  let dataService: DataServiceAbstract;
  let notifyService: NotifyServiceAbstract;

  const message = new Message();
  message.id = 'messageId1';
  message.mode = MessageMode.light;
  message.body = 'Test message body';

  const defaultSendMessageData = { usersCount: 3, wasSent: false };
  const defaultUserIds = ['user1', 'user2', 'user3'];
  const defaultUsers: User[] = [
    { id: 'user1', registrationToken: 'token1' } as User,
    { id: 'user2', registrationToken: 'token2' } as User,
    { id: 'user3', registrationToken: 'token3' } as User,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Logger, SendMessageUseCase, ...SERVICES_PROVIDER],
    }).compile();

    service = module.get<SendMessageUseCase>(SendMessageUseCase);
    algoService = module.get<AlgoServiceAbstract>(AlgoServiceAbstract);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    notifyService = module.get<NotifyServiceAbstract>(NotifyServiceAbstract);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setupMocks = (overrides?: {
    sendMessageData?: Partial<typeof defaultSendMessageData>;
    userIds?: string[];
    users?: User[];
  }) => {
    const sendMessageData = { ...defaultSendMessageData, ...overrides?.sendMessageData };
    const userIds = overrides?.userIds || defaultUserIds;
    const users = overrides?.users || defaultUsers;

    jest.spyOn(algoService, 'selectUsersShowMessage').mockResolvedValue(sendMessageData);
    jest.spyOn(dataService.users, 'getRandomUserIds').mockResolvedValue(userIds);
    jest.spyOn(dataService.users, 'sendMessageToUsers').mockResolvedValue();
    jest.spyOn(dataService.messages, 'markAsSent').mockResolvedValue();
    jest.spyOn(dataService.users, 'getById').mockImplementation(async (userId) => {
      return users.find((user) => user.id === userId) ?? null;
    });
    jest.spyOn(notifyService, 'notify').mockResolvedValue();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  };

  describe('implementation', () => {
    it('should select users and send a message if there are users to send to', async () => {
      setupMocks({ sendMessageData: { usersCount: 3 } });

      await service.execute(message);

      expect(algoService.selectUsersShowMessage).toHaveBeenCalledWith(message);
      expect(dataService.users.getRandomUserIds).toHaveBeenCalledWith(3);
      expect(dataService.users.sendMessageToUsers).toHaveBeenCalledWith(message, defaultUserIds);
    });

    it('should not send messages if no users are selected', async () => {
      setupMocks({ sendMessageData: { usersCount: 0 } });

      await service.execute(message);

      expect(algoService.selectUsersShowMessage).toHaveBeenCalledWith(message);
      expect(dataService.users.getRandomUserIds).not.toHaveBeenCalled();
      expect(dataService.users.sendMessageToUsers).not.toHaveBeenCalled();
    });

    it('should mark the message as sent if wasSent flag is true', async () => {
      setupMocks({ sendMessageData: { wasSent: true } });

      await service.execute(message);

      expect(algoService.selectUsersShowMessage).toHaveBeenCalledWith(message);
      expect(dataService.messages.markAsSent).toHaveBeenCalledWith(message.id);
    });

    it('should handle the case when both usersCount and wasSent are true', async () => {
      setupMocks({ sendMessageData: { usersCount: 3, wasSent: true } });

      await service.execute(message);

      expect(algoService.selectUsersShowMessage).toHaveBeenCalledWith(message);
      expect(dataService.users.getRandomUserIds).toHaveBeenCalledWith(3);
      expect(dataService.users.sendMessageToUsers).toHaveBeenCalledWith(message, defaultUserIds);
      expect(dataService.messages.markAsSent).toHaveBeenCalledWith(message.id);
    });

    it('should notify users after sending the message', async () => {
      setupMocks();

      await service.execute(message);

      for (const user of defaultUsers) {
        expect(dataService.users.getById).toHaveBeenCalledWith(user.id);
        expect(notifyService.notify).toHaveBeenCalledWith(user.registrationToken, `[light] ${message.body}`);
      }
    });

    it('should log a warning if a user returned by the algorithm is not found', async () => {
      setupMocks({
        userIds: ['user1', 'user2'],
        users: [{ id: 'user1', registrationToken: 'token1' } as User],
      });

      await service.execute(message);

      expect(dataService.users.getById).toHaveBeenCalledWith('user1');
      expect(dataService.users.getById).toHaveBeenCalledWith('user2');
      expect(Logger.prototype.warn).toHaveBeenCalledWith('Cannot find user with id user2 but algo returns it');
    });
  });
});
