import { forwardRef, Module } from '@nestjs/common';
import { AlgoServiceAbstract } from '@core';
import { LinearAlgoService } from './linear-algo.service';
import { DataServicesModule, DateServicesModule } from '@services';

/**
 * This module is a linear algo implementation
 */
@Module({
  imports: [forwardRef(() => DataServicesModule), forwardRef(() => DateServicesModule)],
  providers: [{ provide: AlgoServiceAbstract, useClass: LinearAlgoService }],
  exports: [AlgoServiceAbstract],
})
export class LinearAlgoModule {}
