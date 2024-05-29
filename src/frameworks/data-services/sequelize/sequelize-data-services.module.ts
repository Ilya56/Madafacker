import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { IncomeUserMessagesModel, UserModel } from './models';
import { MessageModel } from './models';
import { DataServiceAbstract } from '@core';
import { SequelizeDataServices } from './sequelize-data-services.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeOptions } from 'sequelize-typescript';
import { initSequelizeCLS, SequelizeTransactionalModule } from 'sequelize-transactional-decorator';
import { ConfigType } from '@config';
import { Dialect } from 'sequelize/types/sequelize';
import { getDialectPackageByName } from './dialectModuleFactory';

/**
 * This call is required by the sequelize-transactional-decorator lib
 */
initSequelizeCLS();

/**
 * This module is a Sequelize data service implementation. You can create another service to implement DataServiceAbstract
 */
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): SequelizeOptions => ({
        ...configService.get<ConfigType['database']>('database'),
        dialectModule: getDialectPackageByName(configService.get<Dialect>('database.dialect')),
        models: [UserModel, MessageModel, IncomeUserMessagesModel],
      }),
      inject: [ConfigService],
    }),
    SequelizeTransactionalModule.register(),
  ],
  providers: [{ provide: DataServiceAbstract, useClass: SequelizeDataServices }, SequelizeModule],
  exports: [DataServiceAbstract],
})
export class SequelizeDataServicesModule {}
