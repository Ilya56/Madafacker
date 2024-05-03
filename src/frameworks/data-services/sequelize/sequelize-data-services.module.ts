import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { IncomeUserMessagesModel, UserModel } from './models';
import { MessageModel } from './models';
import { DataServiceAbstract } from '@core';
import { SequelizeDataServices } from './sequelize-data-services.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeOptions } from 'sequelize-typescript';

/**
 * This module is a Sequelize data service implementation. You can create another service to implement DataServiceAbstract
 */
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): SequelizeOptions => ({
        ...configService.get('database'),
        models: [UserModel, MessageModel, IncomeUserMessagesModel],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [{ provide: DataServiceAbstract, useClass: SequelizeDataServices }, SequelizeModule],
  exports: [DataServiceAbstract],
})
export class SequelizeDataServicesModule {}
