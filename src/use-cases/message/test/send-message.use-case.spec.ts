import { Test, TestingModule } from '@nestjs/testing';
import { SendMessageUseCase } from '@use-cases/message';
import { Message } from '@core';
import { AlgoServiceAbstract, DataServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@use-cases/test/test-helpers';

describe('SendMessageUseCase', () => {
  let service: SendMessageUseCase;
  let algoService: AlgoServiceAbstract;
  let dataService: DataServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendMessageUseCase, ...SERVICES_PROVIDER],
    }).compile();

    service = module.get<SendMessageUseCase>(SendMessageUseCase);
    algoService = module.get<AlgoServiceAbstract>(AlgoServiceAbstract);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('implementation', () => {
    it('should select users and send a message if there are users to send to', async () => {
      const message = new Message();
      message.id = 'messageId1';
      const sendMessageData = { usersCount: 3 };
      const userIds = ['user1', 'user2', 'user3'];

      jest.spyOn(algoService, 'selectUsersShowMessage').mockResolvedValue(sendMessageData);
      jest.spyOn(dataService.users, 'getRandomUserIds').mockResolvedValue(userIds);
      jest.spyOn(dataService.users, 'sendMessageToUsers').mockResolvedValue();

      await service.execute(message);

      expect(algoService.selectUsersShowMessage).toHaveBeenCalledWith(message);
      expect(dataService.users.getRandomUserIds).toHaveBeenCalledWith(sendMessageData.usersCount);
      expect(dataService.users.sendMessageToUsers).toHaveBeenCalledWith(message, userIds);
    });

    it('should not send messages if no users are selected', async () => {
      const message = new Message();
      message.id = 'messageId1';
      const sendMessageData = { usersCount: 0 };

      jest.spyOn(algoService, 'selectUsersShowMessage').mockResolvedValue(sendMessageData);
      jest.spyOn(dataService.users, 'getRandomUserIds').mockResolvedValue([]);

      await service.execute(message);

      expect(algoService.selectUsersShowMessage).toHaveBeenCalledWith(message);
      expect(dataService.users.getRandomUserIds).not.toHaveBeenCalled();
      expect(dataService.users.sendMessageToUsers).not.toHaveBeenCalled();
    });
  });
});
