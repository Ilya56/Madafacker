import { Module } from '@nestjs/common';
import { SendMessageModule } from './send-message';

/**
 * Jobs module.
 * Re-export all jobs
 */
@Module({
  imports: [SendMessageModule],
  exports: [SendMessageModule],
})
export class JobsModule {}
