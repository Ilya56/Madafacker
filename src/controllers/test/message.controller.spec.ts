import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../message.controller';
import { MessageFactoryService } from '../factories';
import { CreateMessageUseCase } from '@use-cases/message/create-message.use-case';
import { CreateMessageDto } from '../dtos';
import { Message, MessageMode } from '@core';

describe('MessageController', () => {
  let controller: MessageController;
  let factoryService: MessageFactoryService;
  let useCase: CreateMessageUseCase;

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
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    factoryService = module.get<MessageFactoryService>(MessageFactoryService);
    useCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
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
      jest.spyOn(useCase, 'execute').mockResolvedValue(message);

      const result = await controller.create(dto);

      expect(factoryService.createNewMessage).toHaveBeenCalledWith(dto);
      expect(useCase.execute).toHaveBeenCalledWith(message);
      expect(result).toEqual(message);
    });
  });
});
