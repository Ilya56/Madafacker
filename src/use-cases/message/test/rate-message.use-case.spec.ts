import { Test, TestingModule } from '@nestjs/testing';
import { RateMessageUseCase } from '@use-cases/message';
import { DataServiceAbstract, User, UserServiceAbstract } from '@core';
import { OperationNotAllowedException, NotFoundError, MessageRating } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

describe('RateMessageUseCase', () => {
  let service: RateMessageUseCase;
  let dataService: DataServiceAbstract;
  let userService: UserServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateMessageUseCase, ...SERVICES_PROVIDER],
    }).compile();

    service = module.get<RateMessageUseCase>(RateMessageUseCase);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    userService = module.get<UserServiceAbstract>(UserServiceAbstract);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('implementation', () => {
    it('should throw OperationNotAllowedException when user tries to rate their own message', async () => {
      const user = { id: 'user1', outcomeMessages: [{ id: 'message1' }] } as any as User;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);

      const rateMessageInput = { messageId: 'message1', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(OperationNotAllowedException);
    });

    it('should throw OperationNotAllowedException when a message has already been rated', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.messages, 'getUserMessageRating').mockResolvedValue(MessageRating.like);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(OperationNotAllowedException);
    });

    it('should throw NotFoundError when the message does not exist', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.messages, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'rateMessage').mockResolvedValue(false);

      const rateMessageInput = { messageId: 'nonexistent', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(NotFoundError);
    });

    it('should rate the message successfully when all conditions are met', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.messages, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'rateMessage').mockResolvedValue(true);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).resolves.toBeUndefined();
      expect(dataService.messages.getUserMessageRating).toHaveBeenCalledWith('user1', 'message2');
      expect(dataService.messages.rateMessage).toHaveBeenCalledWith('user1', 'message2', MessageRating.like);
    });
  });
});
