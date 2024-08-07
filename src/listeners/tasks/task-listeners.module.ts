import { Module } from '@nestjs/common';
import { SendMessageModule } from './send-message';

/**
 * Listeners module.
 * Import all listener modules
 */
@Module({
  imports: [SendMessageModule],
})
export class TaskListenersModule {}
