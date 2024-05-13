import { Injectable } from '@nestjs/common';
import { DateServiceAbstract, DateUnit } from '@core';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(utc);

/**
 * Implementation of the Date service based on the day.js lib
 */
@Injectable()
export class DayjsDateService extends DateServiceAbstract {
  /**
   * Returns number of ms in the interval. Interval is defined as a number and unit, for example:
   * - 15 days = 15, day
   * - 3 weeks = 3, week
   * - 1 minute = 1, minute
   * @param number number of units in the interval
   * @param unit unit of the interval
   */
  getIntervalDuration(number: number, unit: DateUnit): number {
    return dayjs.duration(number, unit).asMilliseconds();
  }

  /**
   * Returns current date in milliseconds for the UTC timezone
   */
  getTimestampInMs(): number {
    return dayjs().utc().millisecond();
  }
}
