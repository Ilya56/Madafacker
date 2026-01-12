import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { CreateReplyUseCase, GetReplyByIdUseCase, UpdateReplyUseCase } from '@use-cases/reply';
import { CreateReplyDto, ReplyDto, UpdateReplyDto } from './dtos';
import { ReplyFactoryService } from './factories';
import { plainToInstance } from 'class-transformer';

/**
 * Reply actions controller. All related to the reply should be here
 */
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true })
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
  async create(@Body() createReply: CreateReplyDto): Promise<ReplyDto> {
    const reply = this.replyFactoryService.createNewReply(createReply);
    const createdReply = await this.createReplyUseCase.execute({ reply, parentId: createReply.parentId });
    return plainToInstance(ReplyDto, createdReply);
  }

  /**
   * Updates reply based on the id
   * @param updateReply id of the reply to update and updated reply data
   */
  @Patch()
  async update(@Body() updateReply: UpdateReplyDto): Promise<ReplyDto> {
    const reply = this.replyFactoryService.updateReply(updateReply);
    const updatedReply = await this.updateReplyUseCase.execute(reply);

    if (!updatedReply) {
      throw new NotFoundException('Reply with such id was not found');
    }

    return plainToInstance(ReplyDto, updatedReply);
  }

  /**
   * Returns reply with 1 leve of child replies by id
   * @param id id of the reply to retrieve
   */
  @Get('/:id')
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<ReplyDto> {
    const reply = await this.getReplyByIdUseCase.execute(id);

    if (!reply) {
      throw new NotFoundException(`Reply with id ${id} was not found`);
    }

    return plainToInstance(ReplyDto, reply);
  }
}
