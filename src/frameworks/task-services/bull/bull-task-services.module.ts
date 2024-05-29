import { Module } from '@nestjs/common';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { TaskServiceAbstract } from '@core';
import { BullTaskServices } from './bull-task-services.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigType } from '@config';

/**
 * This module is a Bull task service implementation
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): BullRootModuleOptions => ({
        redis: configService.get<ConfigType['redis']>('redis'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [{ provide: TaskServiceAbstract, useClass: BullTaskServices }],
  exports: [TaskServiceAbstract],
})
export class BullTaskServicesModule {}
