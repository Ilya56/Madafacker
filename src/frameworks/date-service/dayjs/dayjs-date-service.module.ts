import { Module } from '@nestjs/common';
import { DateServiceAbstract } from '@core';
import { DayjsDateService } from '@frameworks/date-service/dayjs';

/**
 * This module is a Passport user service implementation. You can create another service to implement UserServiceAbstract
 */
@Module({
  imports: [],
  providers: [{ provide: DateServiceAbstract, useClass: DayjsDateService }],
  exports: [DateServiceAbstract],
})
export class DayjsDateServiceModule {}
