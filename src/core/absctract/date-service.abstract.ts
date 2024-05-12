/**
 * Date units from milliseconds to months
 */
export type DateUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

/**
 * Date service that allow to work with date objects
 */
export abstract class DateServiceAbstract {
  /**
   * Returns number of ms in the interval. Interval is defined as a number and unit, for example:
   * - 15 days = 15, day
   * - 3 weeks = 3, week
   * - 1 minute = 1, minute
   * @param number number of units in the interval
   * @param unit unit of the interval
   */
  public abstract getIntervalDuration(number: number, unit: DateUnit): number;

  /**
   * Returns current date in milliseconds for the UTC timezone
   */
  public abstract getCurrentDateInMilliseconds(): number;
}
