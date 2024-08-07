import { Module } from '@nestjs/common';
import { TaskListenersModule } from './tasks';
import { JobsModule } from './jobs';

/**
 * Listeners module.
 * Import all listener modules
 */
@Module({
  imports: [TaskListenersModule, JobsModule],
})
export class ListenersModule {}
