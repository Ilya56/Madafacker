import { Module } from '@nestjs/common';
import { ServicesModule } from '@services';
import { CreateReplyUseCase } from '@use-cases/reply/create-reply.use-case';

/**
 * Reply use cases module for a Nest.js
 */
@Module({
  imports: [ServicesModule],
  providers: [CreateReplyUseCase],
  exports: [CreateReplyUseCase],
})
export class ReplyUseCasesModule {}
