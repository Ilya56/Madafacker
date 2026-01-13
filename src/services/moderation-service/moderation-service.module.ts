import { Module } from '@nestjs/common';
import { OpenaiModerationServicesModule } from '@frameworks/moderation-services/openai';

/**
 * This service defines what moderation service implementation should be used now
 */
@Module({
  imports: [OpenaiModerationServicesModule],
  exports: [OpenaiModerationServicesModule],
})
export class ModerationServiceModule {}
