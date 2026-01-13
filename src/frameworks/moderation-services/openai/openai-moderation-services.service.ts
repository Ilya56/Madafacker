import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModerationResult, ModerationServiceAbstract } from '@core';
import OpenAI from 'openai';

/**
 * Implementation of the Moderation service based on the OpenAI moderation module
 */
@Injectable()
export class OpenaiModerationService extends ModerationServiceAbstract {
  private readonly client: OpenAI;

  /**
   * Creates OpenAI client using api key from application configuration
   * @param configService nest config service to retrieve OpenAI api key
   */
  constructor(private readonly configService: ConfigService) {
    super();

    const apiKey = this.configService.get<string>('openai.apiKey') || '';
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Moderates provided text using OpenAI Moderation API
   * @param text text to moderate
   * @throws Error when provider returns unexpected response shape
   */
  async moderate(text: string): Promise<ModerationResult> {
    const response = await this.client.moderations.create({
      input: text,
    });

    const result = response?.results?.[0];
    const categoryScores = result?.category_scores;

    if (!result || typeof result.flagged !== 'boolean' || !categoryScores || typeof categoryScores !== 'object') {
      throw new Error('Invalid moderation provider response');
    }

    return {
      flagged: result.flagged,
      categoryScores: categoryScores as unknown as Record<string, number>,
    };
  }
}
