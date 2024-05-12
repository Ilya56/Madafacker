import { Module } from '@nestjs/common';
import { UserFactoryService } from './user-factory.service';
import { MessageFactoryService } from './message-factory.service';

/**
 * Just a module to group all factories together
 */
@Module({
  providers: [UserFactoryService, MessageFactoryService],
  exports: [UserFactoryService, MessageFactoryService],
})
export class FactoryModule {}
