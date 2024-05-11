import { Module } from '@nestjs/common';
import { ControllersModule } from '@controllers';
import { CustomConfigModule } from '@config';

/**
 * Main app module, start here
 */
@Module({
  imports: [CustomConfigModule, ControllersModule],
  providers: [],
})
export class AppModule {}
