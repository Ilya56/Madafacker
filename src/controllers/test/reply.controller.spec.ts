import { Test, TestingModule } from '@nestjs/testing';
import { ReplyFactoryService } from '../factories';
import { CreateReplyDto } from '../dtos';
import { Message, Reply } from '@core';
import { ReplyController } from '../reply.controller';
import { CreateReplyUseCase } from '@use-cases/reply';

describe('MessageController', () => {
  let controller: ReplyController;
  let factoryService: ReplyFactoryService;
  let createReplyUseCase: CreateReplyUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplyController],
      providers: [
        {
          provide: ReplyFactoryService,
          useValue: { createNewReply: jest.fn() },
        },
        {
          provide: CreateReplyUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(new Message()) },
        },
      ],
    }).compile();

    controller = module.get<ReplyController>(ReplyController);
    factoryService = module.get<ReplyFactoryService>(ReplyFactoryService);
    createReplyUseCase = module.get<CreateReplyUseCase>(CreateReplyUseCase);
  });

  describe('create', () => {
    it('should create and process a new message', async () => {
      const dto = new CreateReplyDto();
      dto.body = 'Hello World';
      dto.public = true;
      dto.parentId = 'parent-id';

      const reply = new Reply();
      reply.body = dto.body;
      reply.public = dto.public;

      jest.spyOn(factoryService, 'createNewReply').mockReturnValue(reply);
      jest.spyOn(createReplyUseCase, 'execute').mockResolvedValue(reply);

      const result = await controller.create(dto);

      expect(factoryService.createNewReply).toHaveBeenCalledWith(dto);
      expect(createReplyUseCase.execute).toHaveBeenCalledWith({ reply, parentId: 'parent-id' });
      expect(result).toEqual(reply);
    });
  });
});
