import { Module } from '@nestjs/common';
import { SendMessageListener } from './send-message.listener';
import { MessageUseCasesModule } from '@use-cases/message/message-use-cases.module';

/**
 * Listeners module.
 * Import all listener modules
 */
@Module({
  imports: [MessageUseCasesModule],
  providers: [SendMessageListener],
})
export class ListenersModule {}
