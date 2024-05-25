import { Body, Controller, Post } from '@nestjs/common';
import { CreateReplyUseCase } from '@use-cases/reply';
import { CreateReplyDto } from './dtos';
import { ReplyFactoryService } from './factories/reply-factory.service';

/**
 * Reply actions controller. All related to the reply should be here
 */
@Controller('/api/reply')
export class ReplyController {
  constructor(
    private readonly replyFactoryService: ReplyFactoryService,
    private readonly createReplyUseCase: CreateReplyUseCase,
  ) {}

  /**
   * Creates new reply
   * @param createReply new reply data
   */
  @Post()
  create(@Body() createReply: CreateReplyDto) {
    const reply = this.replyFactoryService.createNewReply(createReply);
    return this.createReplyUseCase.execute({ reply, parentId: createReply.parentId });
  }
}
