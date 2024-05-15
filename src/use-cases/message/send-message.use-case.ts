import { CommandAbstract } from '@use-cases/abstract';
import { Message } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendMessageUseCase extends CommandAbstract<Message, void> {
  /**
   * Select users to send a message and based on the algo response send this message to the selected users
   * @param message a message to send
   * @protected
   */
  protected async implementation(message: Message): Promise<void> {
    const sendMessageData = await this.algoService.selectUsersShowMessage(message);
    if (sendMessageData.usersCount) {
      const randomUserIds = await this.dataService.users.getRandomUserIds(sendMessageData.usersCount);
      await this.dataService.users.sendMessageToUsers(message, randomUserIds);
    }
  }
}
