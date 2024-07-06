import { Module } from '@nestjs/common';
import { TaskServiceAbstract } from '@core';
import { BullTaskServices } from './bull-task-services.service';
import { ConfigModule } from '@nestjs/config';

/**
 * This module is a Bull task service implementation
 */
@Module({
  imports: [ConfigModule],
  providers: [{ provide: TaskServiceAbstract, useClass: BullTaskServices }],
  exports: [TaskServiceAbstract],
})
export class BullTaskServicesModule {}
