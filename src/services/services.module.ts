import { Module } from '@nestjs/common';
import { DataServiceModule } from './data-service/data-service.module';
import { UserServiceModule } from './user-service/user-service.module';
import { DateServicesModule } from './date-service/date-service.module';
import { AlgoServiceModule } from './algo-service/algo-service.module';
import { TaskServiceModule } from './task-service/task-service.module';

@Module({
  imports: [DataServiceModule, UserServiceModule, DateServicesModule, AlgoServiceModule, TaskServiceModule],
  exports: [DataServiceModule, UserServiceModule, DateServicesModule, AlgoServiceModule, TaskServiceModule],
})
export class ServicesModule {}
