import { Test, TestingModule } from '@nestjs/testing';
import { ReplyFactoryService } from '../factories';
import { CreateReplyDto, UpdateReplyDto } from '../dtos';
import { ReplyController } from '../reply.controller';
import { CreateReplyUseCase, GetReplyByIdUseCase, UpdateReplyUseCase } from '@use-cases/reply';
import { Reply } from '@core';
import { NotFoundException } from '@nestjs/common';

describe('ReplyController', () => {
  let controller: ReplyController;
  let factoryService: ReplyFactoryService;
  let createReplyUseCase: CreateReplyUseCase;
  let updateReplyUseCase: UpdateReplyUseCase;
  let getReplyByIdUseCase: GetReplyByIdUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplyController],
      providers: [
        {
          provide: ReplyFactoryService,
          useValue: {
            createNewReply: jest.fn(),
            updateReply: jest.fn(),
          },
        },
        {
          provide: CreateReplyUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(new Reply()) },
        },
        {
          provide: UpdateReplyUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: GetReplyByIdUseCase,
          useValue: { execute: jest.fn().mockResolvedValue(new Reply()) },
        },
      ],
    }).compile();

    controller = module.get<ReplyController>(ReplyController);
    factoryService = module.get<ReplyFactoryService>(ReplyFactoryService);
    createReplyUseCase = module.get<CreateReplyUseCase>(CreateReplyUseCase);
    updateReplyUseCase = module.get<UpdateReplyUseCase>(UpdateReplyUseCase);
    getReplyByIdUseCase = module.get<GetReplyByIdUseCase>(GetReplyByIdUseCase);
  });

  describe('create', () => {
    it('should create and process a new reply', async () => {
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

  describe('update', () => {
    it('should update an existing reply', async () => {
      const dto = new UpdateReplyDto();
      dto.id = 'reply-id';
      dto.public = false;

      const reply = new Reply();
      reply.id = dto.id;
      reply.public = dto.public;

      jest.spyOn(factoryService, 'updateReply').mockReturnValue(reply);
      jest.spyOn(updateReplyUseCase, 'execute').mockResolvedValue(reply);

      const result = await controller.update(dto);

      expect(factoryService.updateReply).toHaveBeenCalledWith(dto);
      expect(updateReplyUseCase.execute).toHaveBeenCalledWith(reply);
      expect(result).toEqual(reply);
    });

    it('should throw NotFoundException if the reply is not found', async () => {
      const dto = new UpdateReplyDto();
      dto.id = 'reply-id';
      dto.public = false;

      const reply = new Reply();
      reply.id = dto.id;
      reply.public = dto.public;

      jest.spyOn(factoryService, 'updateReply').mockReturnValue(reply);
      jest.spyOn(updateReplyUseCase, 'execute').mockResolvedValue(null);

      await expect(controller.update(dto)).rejects.toThrow(NotFoundException);

      expect(factoryService.updateReply).toHaveBeenCalledWith(dto);
      expect(updateReplyUseCase.execute).toHaveBeenCalledWith(reply);
    });
  });

  describe('getById', () => {
    it('should return a reply with the given id', async () => {
      const id = 'reply-id';
      const reply = new Reply();
      reply.id = id;

      jest.spyOn(getReplyByIdUseCase, 'execute').mockResolvedValue(reply);

      const result = await controller.getById(id);

      expect(getReplyByIdUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(reply);
    });

    it('should throw NotFoundException if the reply is not found', async () => {
      const id = 'reply-id';

      jest.spyOn(getReplyByIdUseCase, 'execute').mockResolvedValue(null);

      const result = await controller.getById(id);

      expect(getReplyByIdUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(null);
    });
  });
});
