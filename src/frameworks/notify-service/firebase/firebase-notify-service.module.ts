import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * This module is a Firebase notification service implementation
 */
@Module({
  imports: [ConfigModule],
})
export class FirebaseNotifyServiceModule {}
