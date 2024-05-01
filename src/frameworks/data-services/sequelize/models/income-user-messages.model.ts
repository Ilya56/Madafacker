import { ForeignKey as ForeignKeyType, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Model, Table, ForeignKey } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { MessageModel } from './message.model';

/**
 * This model is created to store many-to-many relation between user and messages.
 * User can see a lot of different incoming messages and one message can income to many users
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
}
