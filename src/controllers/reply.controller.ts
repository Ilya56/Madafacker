import { Body, Controller, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CreateReplyUseCase, GetReplyByIdUseCase, UpdateReplyUseCase } from '@use-cases/reply';
import { CreateReplyDto, UpdateReplyDto } from './dtos';
import { ReplyFactoryService } from './factories';

/**
 * Reply actions controller. All related to the reply should be here
 */
@Controller('/api/reply')
export class ReplyController {
  constructor(
    private readonly replyFactoryService: ReplyFactoryService,
    private readonly createReplyUseCase: CreateReplyUseCase,
    private readonly updateReplyUseCase: UpdateReplyUseCase,
    private readonly getReplyByIdUseCase: GetReplyByIdUseCase,
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

  /**
   * Updates reply based on the id
   * @param updateReply id of the reply to update and updated reply data
   */
  @Patch()
  async update(@Body() updateReply: UpdateReplyDto) {
    const reply = this.replyFactoryService.updateReply(updateReply);
    const updatedReply = await this.updateReplyUseCase.execute(reply);

    if (!updatedReply) {
      throw new NotFoundException('Reply with such id was not found');
    }

    return updatedReply;
  }

  /**
   * Returns reply with 1 leve of child replies by id
   * @param id id of the reply to retrieve
   */
  @Get('/:id')
  async getById(@Param('id') id: string) {
    const reply = await this.getReplyByIdUseCase.execute(id);

    if (!reply) {
      throw new NotFoundException(`Reply with id ${id} was not found`);
    }

    return reply;
  }
}
