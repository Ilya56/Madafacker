import { Module } from '@nestjs/common';
import { LinearAlgoService } from '@frameworks/algo-service/linear';

/**
 * This service defines what algo service implementation should be used now
 */
@Module({
  imports: [LinearAlgoService],
  exports: [LinearAlgoService],
})
export class AlgoServiceModule {}
