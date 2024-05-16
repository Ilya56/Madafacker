import { Message } from '@core';
import { Process, Processor } from '@nestjs/bull';
import { SendMessageUseCase } from '@use-cases/message';

/**
 * Bull listener
 */
@Processor('sendMessage')
export class SendMessageListener {
  constructor(private readonly sendMessageUseCase: SendMessageUseCase) {}

  /**
   * Process function of the job
   * @param job bull bob object
   */
  @Process()
  run(message: Message) {
    return this.sendMessageUseCase.execute(message);
  }
}
