import { Module } from '@nestjs/common';
import { SendMessageListener } from './send-message.listener';
import { MessageUseCasesModule } from '@use-cases/message/message-use-cases.module';
import { TaskServicesModule } from '@services';

/**
 * Send message listener module. Imports required modules and provide listener
 */
@Module({
  imports: [TaskServicesModule, MessageUseCasesModule],
  providers: [SendMessageListener],
})
export class SendMessageModule {}
