import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../message.controller';
import { MessageFactoryService } from '../factories';
import { CreateMessageUseCase } from '@use-cases/message/create-message.use-case';
import { CreateMessageDto, RatingDto } from '../dtos';
import { Message, MessageMode, MessageRating } from '@core';
import { RateMessageUseCase, RetrieveIncomeMessagesUseCase, RetrieveOutcomeMessagesUseCase } from '@use-cases/message';

describe('MessageController', () => {
  let controller: MessageController;
  let factoryService: MessageFactoryService;
  let createMessageUseCase: CreateMessageUseCase;
  let retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase;
  let retrieveOutcomeMessagesUseCase: RetrieveOutcomeMessagesUseCase;
  let rateMessageUseCase: RateMessageUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageFactoryService,
          useValue: { createNewMessage: jest.fn() },
        },
        {
          provide: CreateMessageUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(new Message()) },
        },
        {
          provide: RetrieveIncomeMessagesUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([new Message()]) },
        },
        {
          provide: RetrieveOutcomeMessagesUseCase,
          useValue: { execute: jest.fn().mockResolvedValue([new Message()]) },
        },
        {
          provide: RateMessageUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    factoryService = module.get<MessageFactoryService>(MessageFactoryService);
    createMessageUseCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
    retrieveIncomeMessagesUseCase = module.get<RetrieveIncomeMessagesUseCase>(RetrieveIncomeMessagesUseCase);
    retrieveOutcomeMessagesUseCase = module.get<RetrieveOutcomeMessagesUseCase>(RetrieveOutcomeMessagesUseCase);
    rateMessageUseCase = module.get<RateMessageUseCase>(RateMessageUseCase);
  });

  describe('create', () => {
    it('should create and process a new message', async () => {
      const dto = new CreateMessageDto();
      dto.body = 'Hello World';
      dto.mode = MessageMode.light;

      const message = new Message();
      message.body = dto.body;
      message.mode = dto.mode;

      jest.spyOn(factoryService, 'createNewMessage').mockReturnValue(message);
      jest.spyOn(createMessageUseCase, 'execute').mockResolvedValue(message);

      const result = await controller.create(dto);

      expect(factoryService.createNewMessage).toHaveBeenCalledWith(dto);
      expect(createMessageUseCase.execute).toHaveBeenCalledWith(message);
      expect(result).toEqual(message);
    });
  });

  describe('retrieveIncoming', () => {
    it('should retrieve incoming messages for the current user', async () => {
      const messages = [new Message(), new Message()];

      jest.spyOn(retrieveIncomeMessagesUseCase, 'execute').mockResolvedValue(messages);

      const result = await controller.retrieveIncoming();

      expect(retrieveIncomeMessagesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(messages);
    });
  });

  describe('retrieveOutcome', () => {
    it('should retrieve outcoming messages for the current user', async () => {
      const messages = [new Message(), new Message()];

      jest.spyOn(retrieveOutcomeMessagesUseCase, 'execute').mockResolvedValue(messages);

      const result = await controller.retrieveOutcome();

      expect(retrieveOutcomeMessagesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(messages);
    });
  });

  describe('rate', () => {
    it('should rate a message', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000';
      const ratingDto = new RatingDto();
      ratingDto.rating = MessageRating.like;

      jest.spyOn(rateMessageUseCase, 'execute').mockResolvedValue(undefined);

      const result = await controller.rate(messageId, ratingDto);

      expect(rateMessageUseCase.execute).toHaveBeenCalledWith({ messageId, rating: ratingDto.rating });
      expect(result).toBeUndefined();
    });
  });
});
