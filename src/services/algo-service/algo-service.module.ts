import { Module } from '@nestjs/common';
import { LinearAlgoModule } from '@frameworks/algo-services/linear';

/**
 * This service defines what algo service implementation should be used now
 */
@Module({
  imports: [LinearAlgoModule],
  exports: [LinearAlgoModule],
})
export class AlgoServiceModule {}
