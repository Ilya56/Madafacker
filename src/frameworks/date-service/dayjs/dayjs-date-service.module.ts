import { Module } from '@nestjs/common';
import { DateServiceAbstract } from '@core';
import { DayjsDateService } from '@frameworks/date-service/dayjs';

/**
 * This module is a DayJs date service implementation
 */
@Module({
  imports: [],
  providers: [{ provide: DateServiceAbstract, useClass: DayjsDateService }],
  exports: [DateServiceAbstract],
})
export class DayjsDateServiceModule {}
