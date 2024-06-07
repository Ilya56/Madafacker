import { Injectable } from '@nestjs/common';
import { Reply } from '@core';
import { CreateReplyDto, UpdateReplyDto } from '../dtos';

/**
 * This class is created to process data from HTTP to Entity
 */
@Injectable()
export class ReplyFactoryService {
  /**
   * Creates and returns new reply entity based on the creation reply dto
   * @param createReply create reply data from request
   */
  createNewReply(createReply: CreateReplyDto) {
    const reply = new Reply();
    reply.body = createReply.body;
    reply.public = createReply.public;
    return reply;
  }

  /**
   * Create and returns new reply entity based on the updating reply dto
   * @param updateReply update reply data from request
   */
  updateReply(updateReply: UpdateReplyDto) {
    const reply = new Reply();
    reply.id = updateReply.id;
    reply.public = updateReply.public;
    return reply;
  }
}
