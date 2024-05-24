import { Module } from '@nestjs/common';
import { ServicesModule } from '@services';

/**
 * Reply use cases module for a Nest.js
 */
@Module({
  imports: [ServicesModule],
  providers: [],
  exports: [],
})
export class ReplyUseCasesModule {}
