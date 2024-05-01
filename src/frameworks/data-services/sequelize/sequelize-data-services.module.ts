import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models';
import { MessageModel } from './models';
import { DataServiceAbstract } from '../../../core';
import { SequelizeDataServices } from './sequelize-data-services.service';

@Module({
  imports: [
    SequelizeModule.forRoot({
      models: [UserModel, MessageModel], // TODO: create config for a sequelize
    }),
  ],
  providers: [{ provide: DataServiceAbstract, useClass: SequelizeDataServices }, SequelizeModule],
  exports: [DataServiceAbstract],
})
export class SequelizeDataServicesModule {}
