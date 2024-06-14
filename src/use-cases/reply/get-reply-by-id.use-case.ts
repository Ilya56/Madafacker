import { QueryAbstract } from '@use-cases/abstract';
import { Reply } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetReplyByIdUseCase extends QueryAbstract<Reply['id'], Reply | null> {
  /**
   * Returns a reply instance with populated child replies
   * @param replyId reply id to search
   * @protected
   */
  protected implementation(replyId: Reply['id']): Promise<Reply | null> {
    return this.dataService.replies.getByIdWithPopulatedReplies(replyId, 1);
  }
}
