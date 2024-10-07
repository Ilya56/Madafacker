import { Module } from '@nestjs/common';
import { MonitorServiceModule } from './services/monitor-service/monitor-service.module';
import { ControllersModule } from '@controllers';
import { CustomConfigModule } from '@config';
import { ListenersModule } from '@listeners';

/**
 * Main app module, start here
 */
@Module({
  // listeners should be before controllers
  imports: [MonitorServiceModule, CustomConfigModule, ListenersModule, ControllersModule],
  providers: [],
})
export class AppModule {}
