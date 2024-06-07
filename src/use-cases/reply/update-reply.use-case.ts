import { CommandAbstract } from '@use-cases/abstract';
import { Reply } from '@core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateReplyUseCase extends CommandAbstract<Reply, Reply | null> {
  /**
   * Updates a reply with the same id as a reply object and updates it.
   * If no reply found, returns null
   * @param reply reply object to update in the storage
   */
  protected implementation(reply: Reply): Promise<Reply | null> {
    return this.dataService.replies.update(reply.id, reply);
  }
}
