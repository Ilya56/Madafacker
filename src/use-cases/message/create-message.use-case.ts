import { CommandAbstract } from '@use-cases/abstract';
import { Message, MessageMode, ModerationException } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateMessageUseCase extends CommandAbstract<Message, Message> {
  /**
   * Creates a new message for the current user and send it to the users
   * Message MUST be moderated synchronously before creation and distribution
   * @param message message object to create without an author
   */
  protected async implementation(message: Message): Promise<Message> {
    message.author = await this.userService.getCurrentUser();

    const threshold = this.getModerationThreshold(message.mode);

    let moderationResult: { flagged: boolean; categoryScores: Record<string, number> };
    try {
      moderationResult = await this.moderationService.moderate(message.body);
    } catch (e) {
      throw new ModerationException('Message moderation failed. Please try again later.');
    }

    const { categoryScores } = moderationResult;

    const scores = Object.entries(categoryScores ?? {});

    const exceeded = scores.find(([, score]) => typeof score === 'number' && score > threshold);

    if (exceeded) {
      const [category] = exceeded;
      throw new ModerationException(`Message rejected: moderation threshold exceeded for "${category}"`);
    }

    const createdMessage = await this.dataService.messages.create(message);

    await this.taskService.sendMessage.addTask(createdMessage);

    createdMessage.author = message.author;

    return createdMessage;
  }

  /**
   * Returns moderation threshold for the given mode.
   * Uses safe defaults if the configuration is invalid to ensure fail-close safety.
   * @param mode message moderation mode ('light' or 'dark')
   */
  private getModerationThreshold(mode: MessageMode): number {
    const configKey = mode === MessageMode.light ? 'moderation.thresholdLight' : 'moderation.thresholdDark';
    const defaultValue = mode === MessageMode.light ? 0.01 : 0.4;

    const threshold = this.configService.get<number>(configKey);

    // Ensure fail-close: if a threshold is invalid (NaN/null/undefined), use safe default
    if (threshold == null || isNaN(threshold)) {
      return defaultValue;
    }

    return threshold;
  }
}
