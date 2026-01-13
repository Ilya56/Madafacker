import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModerationServiceAbstract } from '@core';
import { OpenaiModerationService } from './openai-moderation-services.service';

/**
 * This module is an OpenAI Moderation service implementation
 */
@Module({
  imports: [ConfigModule],
  providers: [{ provide: ModerationServiceAbstract, useClass: OpenaiModerationService }],
  exports: [ModerationServiceAbstract],
})
export class OpenaiModerationServicesModule {}
