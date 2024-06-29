import { Controller, Post } from '@nestjs/common';
import { SendMessagesJob } from '@jobs';
import { ApiKey } from './auth/api-key.guard';

/**
 * Cron jobs controller. Is created to start cron using 3rd party tools
 */
@ApiKey()
@Controller('api/cron')
export class CronController {
  constructor(private sendMessagesJob: SendMessagesJob) {}

  /**
   * Send messages using a cron job
   */
  @Post('/send-messages')
  sendMessages() {
    return this.sendMessagesJob.execute();
  }
}
