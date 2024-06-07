import { Module } from '@nestjs/common';
import { ServicesModule } from '@services';
import { CreateReplyUseCase } from '@use-cases/reply/create-reply.use-case';
import { UpdateReplyUseCase } from '@use-cases/reply/update-reply.use-case';

/**
 * Reply use cases module for a Nest.js
 */
@Module({
  imports: [ServicesModule],
  providers: [CreateReplyUseCase, UpdateReplyUseCase],
  exports: [CreateReplyUseCase, UpdateReplyUseCase],
})
export class ReplyUseCasesModule {}
