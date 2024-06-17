import { CommandAbstract } from '@use-cases/abstract';
import { NotFoundError, Reply } from '@core';
import { Injectable } from '@nestjs/common';

type CreateReplyInput = {
  reply: Reply;
  parentId: Reply['parent']['id'];
};

@Injectable()
export class CreateReplyUseCase extends CommandAbstract<CreateReplyInput, Reply> {
  /**
   * Creates a new reply from the current user to the provided message
   * If user tries to reply on the message that not exists, it throws not found error
   * @param reply reply object
   * @param parentId id of the message to reply
   */
  protected async implementation({ reply, parentId }: CreateReplyInput): Promise<Reply> {
    reply.author = await this.userService.getCurrentUser();
    const parentMessage = await this.dataService.messages.getById(parentId);

    if (!parentMessage) {
      throw new NotFoundError(`Message with id ${parentId} not found`);
    }

    reply.parent = parentMessage;
    reply.mode = parentMessage.mode;

    return this.dataService.replies.create(reply);
  }
}
