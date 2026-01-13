import { CommandAbstract } from '@use-cases/abstract';
import { Message, ModerationException } from '@core';
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

    const thresholdLight = this.configService.get<number>('moderation.thresholdLight') ?? 0.01;
    const thresholdDark = this.configService.get<number>('moderation.thresholdDark') ?? 0.4;

    let moderationResult: { flagged: boolean; categoryScores: Record<string, number> };
    try {
      moderationResult = await this.moderationService.moderate(message.body);
    } catch (e) {
      throw new ModerationException('Message moderation failed. Please try again later.');
    }

    const { categoryScores } = moderationResult;

    const scores = Object.entries(categoryScores ?? {});
    const threshold = message.mode === 'light' ? thresholdLight : thresholdDark;

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
}
