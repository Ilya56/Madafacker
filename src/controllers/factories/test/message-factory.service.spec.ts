import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageDto } from '../../dtos';
import { MessageFactoryService } from '../message-factory.service';
import { Message, MessageMode } from '@core';

describe('MessageFactoryService', () => {
  let service: MessageFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageFactoryService],
    }).compile();

    service = module.get<MessageFactoryService>(MessageFactoryService);
  });

  it('should create a new message entity from CreateMessageDto', () => {
    const dto = new CreateMessageDto();
    dto.body = 'Hello World';
    dto.mode = MessageMode.light;

    const result = service.createNewMessage(dto);

    expect(result).toBeDefined();
    expect(result.body).toEqual(dto.body);
    expect(result.mode).toEqual(dto.mode);
    expect(result).toBeInstanceOf(Message);
  });
});
