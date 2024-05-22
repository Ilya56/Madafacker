import { Module } from '@nestjs/common';
import { DateServiceAbstract } from '@core';
import { DayjsDateService } from './dayjs-date-service.service';

/**
 * This module is a DayJs date service implementation
 */
@Module({
  imports: [],
  providers: [{ provide: DateServiceAbstract, useClass: DayjsDateService }],
  exports: [DateServiceAbstract],
})
export class DayjsDateServiceModule {}
