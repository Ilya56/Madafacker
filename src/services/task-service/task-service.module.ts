import { Module } from '@nestjs/common';
import { BullTaskServicesModule } from '@frameworks/task-services/bull';

/**
 * This service defines what task service implementation should be used now
 */
@Module({
  imports: [BullTaskServicesModule],
  exports: [BullTaskServicesModule],
})
export class TaskServiceModule {}
