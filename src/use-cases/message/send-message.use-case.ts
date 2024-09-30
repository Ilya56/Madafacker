import { CommandAbstract } from '@use-cases/abstract';
import { Message } from '@core';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SendMessageUseCase extends CommandAbstract<Message, void> {
  /**
   * Listeners logger
   * @protected
   */
  protected logger: Logger;

  /**
   * Initialize logger
   */
  constructor() {
    super();
    this.logger = new Logger(SendMessageUseCase.name);
  }

  /**
   * Select users to send a message and based on the algo response send this message to the selected users
   * @param message a message to send
   * @protected
   */
  protected async implementation(message: Message): Promise<void> {
    const userIds = [];
    const sendMessageData = await this.algoService.selectUsersShowMessage(message);

    // send a message to random users if only users count was returned
    if (sendMessageData.usersCount) {
      const randomUserIds = await this.dataService.users.getRandomUserIds(sendMessageData.usersCount);
      await this.dataService.users.sendMessageToUsers(message, randomUserIds);
      userIds.push(...randomUserIds);
    }

    // mark a message as send when no new receivers
    if (sendMessageData.wasSent) {
      await this.dataService.messages.markAsSent(message.id);
    }

    // send notification to all users that receives a message
    const notificationText = `[${message.mode}] ${message.body}`;
    for (const userId of userIds) {
      const user = await this.dataService.users.getById(userId);

      if (!user) {
        this.logger.warn(`Cannot find user with id ${userId} but algo returns it`);
        continue;
      }

      await this.notifyService.notify(user.registrationToken, notificationText);
    }
  }
}
