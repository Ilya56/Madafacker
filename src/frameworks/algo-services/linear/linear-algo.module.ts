import { forwardRef, Module } from '@nestjs/common';
import { AlgoServiceAbstract } from '@core';
import { LinearAlgoService } from './linear-algo.service';
import { DataServiceModule, DateServicesModule } from '@services';

/**
 * This module is a linear algo implementation
 */
@Module({
  imports: [forwardRef(() => DataServiceModule), forwardRef(() => DateServicesModule)],
  providers: [{ provide: AlgoServiceAbstract, useClass: LinearAlgoService }],
  exports: [AlgoServiceAbstract],
})
export class LinearAlgoModule {}
