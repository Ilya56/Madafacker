import { Module } from '@nestjs/common';
import { UserFactoryService } from './user-factory.service';
import { MessageFactoryService } from './message-factory.service';
import { ReplyFactoryService } from './reply-factory.service';

/**
 * Just a module to group all factories together
 */
@Module({
  providers: [UserFactoryService, MessageFactoryService, ReplyFactoryService],
  exports: [UserFactoryService, MessageFactoryService, ReplyFactoryService],
})
export class FactoryModule {}
