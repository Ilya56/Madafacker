/**
 * Moderation result interface. `flagged` means that the message is flagged as potentially harmful
 * `categoryScores` can depend on implementation so need to work with it as unknown object
 */
export type ModerationResult = {
  flagged: boolean;
  categoryScores: Record<string, number>;
};

/**
 * Provider-agnostic moderation service abstraction.
 * Implementations (OpenAI, etc.) must map provider response into ModerationResult.
 */
export abstract class ModerationServiceAbstract {
  abstract moderate(text: string): Promise<ModerationResult>;
}
