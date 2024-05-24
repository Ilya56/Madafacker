import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../message.controller';
import { MessageFactoryService } from '../factories';
import { CreateMessageUseCase } from '@use-cases/message/create-message.use-case';
import { CreateMessageDto } from '../dtos';
import { Message, MessageMode } from '@core';
import { RetrieveIncomeMessagesUseCase, RetrieveOutcomeMessagesUseCase } from '@use-cases/message';

describe('MessageController', () => {
  let controller: MessageController;
  let factoryService: MessageFactoryService;
  let createMessageUseCase: CreateMessageUseCase;
  let retrieveIncomeMessagesUseCase: RetrieveIncomeMessagesUseCase;
  let retrieveOutcomeMessagesUseCase: RetrieveOutcomeMessagesUseCase;

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
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    factoryService = module.get<MessageFactoryService>(MessageFactoryService);
    createMessageUseCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
    retrieveIncomeMessagesUseCase = module.get<RetrieveIncomeMessagesUseCase>(RetrieveIncomeMessagesUseCase);
    retrieveOutcomeMessagesUseCase = module.get<RetrieveOutcomeMessagesUseCase>(RetrieveOutcomeMessagesUseCase);
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

  describe('retrieveIncoming', () => {
    it('should retrieve incoming messages for the current user', async () => {
      const messages = [new Message(), new Message()];

      jest.spyOn(retrieveOutcomeMessagesUseCase, 'execute').mockResolvedValue(messages);

      const result = await controller.retrieveOutcome();

      expect(retrieveOutcomeMessagesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(messages);
    });
  });
});
