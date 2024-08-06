import { ForeignKey as ForeignKeyType, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { MessageModel } from './message.model';
import { User } from '@core';
import { MessageRating } from '@core';

/**
 * This model is created to store many-to-many relation between user and messages.
 * User can see a lot of different incoming messages, and one message can income to many users
 */
@Table
export class IncomeUserMessagesModel extends Model<
  InferAttributes<IncomeUserMessagesModel>,
  InferCreationAttributes<IncomeUserMessagesModel>
> {
  /**
   * User id who retrieves a message as incoming
   */
  @ForeignKey(() => UserModel)
  userId: ForeignKeyType<UserModel['id']>;
  @BelongsTo(() => UserModel)
  user: NonAttribute<User>;

  /**
   * Message id that user retrieves
   */
  @ForeignKey(() => MessageModel)
  messageId: ForeignKeyType<MessageModel['id']>;
  @BelongsTo(() => MessageModel)
  message: NonAttribute<MessageModel>;

  /**
   * Message rating from user
   */
  rating?: MessageRating;
}
