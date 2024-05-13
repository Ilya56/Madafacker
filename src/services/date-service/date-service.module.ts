import { Module } from '@nestjs/common';
import { DayjsDateServiceModule } from '@frameworks/date-service/dayjs';

/**
 * This service defines what date service implementation should be used now
 */
@Module({
  imports: [DayjsDateServiceModule],
  exports: [DayjsDateServiceModule],
})
export class DateServicesModule {}
