import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TaskServiceAbstract } from '@core';
import { BullTaskServices } from './bull-task-services.service';

/**
 * This module is a Bull task service implementation
 */
@Module({
  imports: [BullModule.forRoot({})],
  providers: [{ provide: TaskServiceAbstract, useClass: BullTaskServices }],
  exports: [TaskServiceAbstract],
})
export class BullTaskServicesModule {}
