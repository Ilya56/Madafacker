import { Module } from '@nestjs/common';
import { DataServicesModule } from './data-services/data-services.module';
import { UserServicesModule } from './user-services/user-services.module';
import { DateServicesModule } from './date-service/date-service.module';
import { AlgoServicesModule } from './algo-service/algo-services.module';
import { TaskServicesModule } from './task-services/task-services.module';

@Module({
  imports: [DataServicesModule, UserServicesModule, DateServicesModule, AlgoServicesModule, TaskServicesModule],
  exports: [DataServicesModule, UserServicesModule, DateServicesModule, AlgoServicesModule, TaskServicesModule],
})
export class ServicesModule {}
