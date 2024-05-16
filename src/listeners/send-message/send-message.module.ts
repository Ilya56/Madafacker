import { Module } from '@nestjs/common';
import { SendMessageListener } from './send-message.listener';
import { BullModule } from '@nestjs/bull';
import { MessageUseCasesModule } from '@use-cases/message/message-use-cases.module';

/**
 * Imports message use cases module, register bull queue and provide listener
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sendMessage',
    }),
    MessageUseCasesModule,
  ],
  providers: [SendMessageListener],
})
export class SendMessageModule {}
