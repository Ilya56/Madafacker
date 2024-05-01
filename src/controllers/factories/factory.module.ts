import { Module } from '@nestjs/common';
import { UserFactoryService } from './user-factory.service';

/**
 * Just a module to group all factories together
 */
@Module({
  providers: [UserFactoryService],
  exports: [UserFactoryService],
})
export class FactoryModule {}
