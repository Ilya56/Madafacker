import { Module } from '@nestjs/common';
import { SequelizeDataServicesModule } from '@frameworks/data-services/sequelize';

/**
 * This service defines what data service implementation should be used now
 */
@Module({
  imports: [SequelizeDataServicesModule],
  exports: [SequelizeDataServicesModule],
})
export class DataServicesModule {}
