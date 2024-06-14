import { GenericRepositoryAbstract, Reply } from '@core';

/**
 * This interface is created to extend generic repository with a methods that are useful for a reply entity
 */
export interface ReplyRepositoryAbstract extends GenericRepositoryAbstract<Reply> {
  /**
   * Returns reply by id with populated replies with specified depth
   * @param replyId id of the reply to process
   * @param repliesDepth depth of the replies to retrieve
   */
  getByIdWithPopulatedReplies(replyId: Reply['id'], repliesDepth?: number): Promise<Reply | null>;
}
