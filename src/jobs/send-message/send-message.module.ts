import { Module } from '@nestjs/common';
import { SendMessagesJob } from './send-messages.job';
import { MessageUseCasesModule } from '@use-cases/message/message-use-cases.module';
import { DataServiceModule, TaskServiceModule } from '@services';

/**
 * Send message job module. Imports required modules and provide job
 */
@Module({
  imports: [DataServiceModule, TaskServiceModule, MessageUseCasesModule],
  providers: [SendMessagesJob],
  exports: [SendMessagesJob],
})
export class SendMessageModule {}
