import { Test, TestingModule } from '@nestjs/testing';
import { CreateReplyDto } from '../../dtos';
import { ReplyFactoryService } from '../reply-factory.service';
import { Reply } from '@core';

describe('MessageFactoryService', () => {
  let service: ReplyFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReplyFactoryService],
    }).compile();

    service = module.get<ReplyFactoryService>(ReplyFactoryService);
  });

  it('should create a new message entity from CreateMessageDto', () => {
    const dto = new CreateReplyDto();
    dto.body = 'Hello World';
    dto.public = true;
    dto.parentId = 'parent-id';

    const result = service.createNewReply(dto);

    expect(result).toBeDefined();
    expect(result.body).toEqual(dto.body);
    expect(result.public).toEqual(dto.public);
    expect(result).toBeInstanceOf(Reply);
  });
});
