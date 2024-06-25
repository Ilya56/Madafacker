import { AlgoServiceAbstract, DataServiceAbstract, DateServiceAbstract, Message, ShowMessageOutput } from '@core';
import { Injectable } from '@nestjs/common';

/**
 * This implementation calculates the count of users that should see a message in the current iteration using
 * linear function. Each message will be shown to all users in a week, starting from 10% of all users/
 * If a message was sent to all users and no need to process it again, it should return wasSent = true.
 *
 * f(t) = k * t + c
 * where k is some coefficient, c = total users count / 10
 * k should equal such value to all users to see the message after 1 week
 */
@Injectable()
export class LinearAlgoService extends AlgoServiceAbstract {
  constructor(private readonly dateService: DateServiceAbstract, private readonly dataService: DataServiceAbstract) {
    super();
  }

  /**
   * Returns users count who should see this message after function call
   * It can retrieve message and return an object with number of new users to show a message
   * @param message message that should be processed
   */
  async selectUsersShowMessage(message: Message): Promise<ShowMessageOutput> {
    // Total number of active users in the system
    const totalUsersCount = await this.dataService.users.getTotalUsersCount();
    // Date when a message was created
    const messageCreationDate = message.createdAt;
    // Number of users that already see this message
    const usersAlreadySeeMessageCount = await this.dataService.users.getUsersAlreadySeeMessageCount(message.id);

    const weekInMs = this.dateService.getIntervalDuration(1, 'week');
    const timeDiff = this.dateService.getTimestampInMs() - messageCreationDate.getTime();

    if (timeDiff > weekInMs && usersAlreadySeeMessageCount === totalUsersCount) {
      return { usersCount: 0, wasSent: true };
    }

    const startCountToShow = Math.floor(totalUsersCount * 0.1);
    const k = (totalUsersCount - startCountToShow) / weekInMs;
    const currentCountToShow = Math.round(k * timeDiff + startCountToShow);
    const newCount = currentCountToShow - usersAlreadySeeMessageCount;
    const usersCount = newCount > 0 ? newCount : 0;

    return {
      usersCount,
    };
  }
}
