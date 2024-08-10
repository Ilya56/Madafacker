import { Test, TestingModule } from '@nestjs/testing';
import { RateMessageUseCase } from '@use-cases/message';
import { DataServiceAbstract, Message, User, UserServiceAbstract } from '@core';
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
      jest.spyOn(dataService.incomeUserMessage, 'getUserMessageRating').mockResolvedValue(MessageRating.like);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(OperationNotAllowedException);
    });

    it('should throw NotFoundError when the message does not exist', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.incomeUserMessage, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'getById').mockResolvedValue(null);

      const rateMessageInput = { messageId: 'nonexistent', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when the message author does not exist', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      const message = { id: 'message2' } as Message;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.incomeUserMessage, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'getById').mockResolvedValue(message);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when the message cannot be rated for the user', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      const message = { id: 'message2', author: {} as User } as Message;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.incomeUserMessage, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'getById').mockResolvedValue(message);
      jest.spyOn(dataService.incomeUserMessage, 'rateMessage').mockResolvedValue(false);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).rejects.toThrow(NotFoundError);
    });

    it('should add coins to the message author when the message is rated', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      const author = { id: 'author1' } as User;
      const message = { id: 'message2', author } as Message;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.incomeUserMessage, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'getById').mockResolvedValue(message);
      jest.spyOn(dataService.incomeUserMessage, 'rateMessage').mockResolvedValue(true);
      jest.spyOn(dataService.users, 'addCoins').mockResolvedValue(0);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.like };

      await expect(service.execute(rateMessageInput)).resolves.toBeUndefined();
      expect(dataService.incomeUserMessage.getUserMessageRating).toHaveBeenCalledWith('user1', 'message2');
      expect(dataService.incomeUserMessage.rateMessage).toHaveBeenCalledWith('user1', 'message2', MessageRating.like);
      expect(dataService.users.addCoins).toHaveBeenCalledWith('author1', 1);
    });

    it('should not add coins when the rating is dislike', async () => {
      const user = { id: 'user1', outcomeMessages: [] } as any as User;
      const author = { id: 'author1' } as User;
      const message = { id: 'message2', author } as Message;
      jest.spyOn(userService, 'getCurrentUser').mockResolvedValue(user);
      jest.spyOn(dataService.incomeUserMessage, 'getUserMessageRating').mockResolvedValue(null);
      jest.spyOn(dataService.messages, 'getById').mockResolvedValue(message);
      jest.spyOn(dataService.incomeUserMessage, 'rateMessage').mockResolvedValue(true);
      jest.spyOn(dataService.users, 'addCoins').mockResolvedValue(0);

      const rateMessageInput = { messageId: 'message2', rating: MessageRating.dislike };

      await expect(service.execute(rateMessageInput)).resolves.toBeUndefined();
      expect(dataService.incomeUserMessage.getUserMessageRating).toHaveBeenCalledWith('user1', 'message2');
      expect(dataService.incomeUserMessage.rateMessage).toHaveBeenCalledWith(
        'user1',
        'message2',
        MessageRating.dislike,
      );
      expect(dataService.users.addCoins).not.toHaveBeenCalled();
    });
  });
});
