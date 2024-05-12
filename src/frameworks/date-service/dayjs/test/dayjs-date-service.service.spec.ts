import { Test, TestingModule } from '@nestjs/testing';
import { DayjsDateService } from '../dayjs-date-service.service';

describe('DayjsDateService', () => {
  let service: DayjsDateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DayjsDateService],
    }).compile();

    service = module.get<DayjsDateService>(DayjsDateService);
  });

  it('should return the correct duration in milliseconds', () => {
    const MILLISECOND = 1;
    const SECOND = MILLISECOND * 1000;
    const MINUTE = SECOND * 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    const WEEK = DAY * 7;
    /* eslint-disable-next-line @typescript-eslint/no-loss-of-precision */
    const MONTH = DAY * 30.416666666666666; // idk why, maybe average value
    const YEAR = MONTH * 12;

    expect(service.getIntervalDuration(1, 'millisecond')).toEqual(MILLISECOND);
    expect(service.getIntervalDuration(1, 'second')).toEqual(SECOND);
    expect(service.getIntervalDuration(1, 'minute')).toEqual(MINUTE);
    expect(service.getIntervalDuration(1, 'hour')).toEqual(HOUR);
    expect(service.getIntervalDuration(1, 'day')).toEqual(DAY);
    expect(service.getIntervalDuration(1, 'week')).toEqual(WEEK);
    expect(service.getIntervalDuration(1, 'month')).toEqual(MONTH);
    expect(service.getIntervalDuration(1, 'year')).toEqual(YEAR);
  });
});
