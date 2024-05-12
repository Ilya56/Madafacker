import { Injectable } from '@nestjs/common';
import { DateServiceAbstract, DateUnit } from '@core';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/**
 * Implementation of the Date service based on the day.js lib
 */
@Injectable()
export class DayjsDateService implements DateServiceAbstract {
  getIntervalDuration(number: number, unit: DateUnit): number {
    return dayjs.duration(number, unit).asMilliseconds();
  }
}
