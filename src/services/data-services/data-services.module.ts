import { Module } from '@nestjs/common';
import { SequelizeDataServicesModule } from '../../frameworks/data-services/sequelize/sequelize-data-services.module';

@Module({
  imports: [SequelizeDataServicesModule],
  exports: [SequelizeDataServicesModule],
})
export class DataServicesModule {}
