import { CommandAbstract } from '@use-cases/abstract';
import { NotFoundError, OperationNotAllowedException, Reply } from '@core';
import { Injectable } from '@nestjs/common';

type CreateReplyInput = {
  reply: Reply;
  parentId: Reply['parent']['id'];
};

/**
 * Cost of the reply creation
 */
const REPLY_COST = 5;

@Injectable()
export class CreateReplyUseCase extends CommandAbstract<CreateReplyInput, Reply> {
  /**
   * Creates a new reply from the current user to the provided message
   * If user tries to reply on the message that not exists, it throws not found error
   * If use has no enough coins, it throws not allowed operation error
   * If reply is created REPLY_COST coins will be taken from user
   * @param reply reply object
   * @param parentId id of the message to reply
   */
  protected async implementation({ reply, parentId }: CreateReplyInput): Promise<Reply> {
    const user = await this.userService.getCurrentUser({ lock: true });
    reply.author = user;
    const parentMessage = await this.dataService.messages.getById(parentId);

    if (!parentMessage) {
      throw new NotFoundError(`Message with id ${parentId} not found`);
    }

    reply.parent = parentMessage;
    reply.mode = parentMessage.mode;

    if (user.coins < REPLY_COST) {
      throw new OperationNotAllowedException(`User with id ${user.id} has not enough coins to create reply`);
    }

    await this.dataService.users.addCoins(user.id, -REPLY_COST);

    return await this.dataService.replies.create(reply);
  }
}
