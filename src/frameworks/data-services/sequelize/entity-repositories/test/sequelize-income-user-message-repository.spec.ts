import { IncomeUserMessagesModel } from '../../models';
import { MessageRating } from '@core';
import { SequelizeIncomeUserMessageRepository } from '@frameworks/data-services/sequelize/entity-repositories';

describe('SequelizeMessageRepository', () => {
  let repository: SequelizeIncomeUserMessageRepository;
  let findOneSpy: jest.SpyInstance;
  let updateIncomeUserMessageSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = new SequelizeIncomeUserMessageRepository();

    findOneSpy = jest.spyOn(IncomeUserMessagesModel, 'findOne').mockImplementation(async () => null);
    updateIncomeUserMessageSpy = jest.spyOn(IncomeUserMessagesModel, 'update').mockImplementation(async () => [1]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserMessageRating', () => {
    it('should retrieve user message rating', async () => {
      const userId = 'test-user-id';
      const messageId = 'test-message-id';
      const rating = MessageRating.like;
      const incomeUserMessage = { rating } as IncomeUserMessagesModel;

      findOneSpy.mockResolvedValue(incomeUserMessage);

      const result = await repository.getUserMessageRating(userId, messageId);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          userId,
          messageId,
        },
      });
      expect(result).toEqual(rating);
    });

    it('should return null if user message rating does not exist', async () => {
      const userId = 'test-user-id';
      const messageId = 'test-message-id';

      findOneSpy.mockResolvedValue(null);

      const result = await repository.getUserMessageRating(userId, messageId);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          userId,
          messageId,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('rateMessage', () => {
    it('should rate a message', async () => {
      const userId = 'test-user-id';
      const messageId = 'test-message-id';
      const rating = MessageRating.like;

      const result = await repository.rateMessage(userId, messageId, rating);

      expect(result).toBeTruthy();
      expect(updateIncomeUserMessageSpy).toHaveBeenCalledWith(
        {
          rating,
        },
        {
          where: {
            userId,
            messageId,
          },
        },
      );
    });
  });
});
