import { Module } from '@nestjs/common';
import { ControllersModule } from '@controllers';
import { CustomConfigModule } from '@config';
import { ListenersModule } from '@listeners';

/**
 * Main app module, start here
 */
@Module({
  imports: [CustomConfigModule, ControllersModule, ListenersModule],
  providers: [],
})
export class AppModule {}
