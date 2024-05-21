import { ForeignKey as ForeignKeyType, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { MessageModel } from './message.model';
import { User } from '@core';

/**
 * This model is created to store many-to-many relation between user and messages.
 * User can see a lot of different incoming messages, and one message can income to many users
 */
@Table
export class IncomeUserMessagesModel extends Model<
  InferAttributes<IncomeUserMessagesModel>,
  InferCreationAttributes<IncomeUserMessagesModel>
> {
  @ForeignKey(() => UserModel)
  userId: ForeignKeyType<UserModel['id']>;

  @ForeignKey(() => MessageModel)
  messageId: ForeignKeyType<MessageModel['id']>;

  @BelongsTo(() => UserModel)
  user: NonAttribute<User>;

  @BelongsTo(() => MessageModel)
  message: NonAttribute<MessageModel>;
}
