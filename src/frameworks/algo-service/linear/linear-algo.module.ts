import { Module } from '@nestjs/common';
import { AlgoServiceAbstract } from '@core';
import { LinearAlgoService } from './linear-algo.service';

/**
 * This module is a linear algo implementation
 */
@Module({
  imports: [],
  providers: [{ provide: AlgoServiceAbstract, useClass: LinearAlgoService }],
  exports: [AlgoServiceAbstract],
})
export class LinearAlgoModule {}
