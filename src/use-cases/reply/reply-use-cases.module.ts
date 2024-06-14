import { Module } from '@nestjs/common';
import { ServicesModule } from '@services';
import { CreateReplyUseCase } from '@use-cases/reply/create-reply.use-case';
import { UpdateReplyUseCase } from '@use-cases/reply/update-reply.use-case';
import { GetReplyByIdUseCase } from '@use-cases/reply/get-reply-by-id.use-case';

/**
 * Reply use cases module for a Nest.js
 */
@Module({
  imports: [ServicesModule],
  providers: [CreateReplyUseCase, UpdateReplyUseCase, GetReplyByIdUseCase],
  exports: [CreateReplyUseCase, UpdateReplyUseCase, GetReplyByIdUseCase],
})
export class ReplyUseCasesModule {}
