import { Module } from '@nestjs/common';
import { LinearAlgoModule } from '@frameworks/algo-service/linear';

/**
 * This service defines what algo service implementation should be used now
 */
@Module({
  imports: [LinearAlgoModule],
  exports: [LinearAlgoModule],
})
export class AlgoServicesModule {}
