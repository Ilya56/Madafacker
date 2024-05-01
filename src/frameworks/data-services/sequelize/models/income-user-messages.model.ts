import { ForeignKey as ForeignKeyType, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Model, Table, ForeignKey } from 'sequelize-typescript';
import { UserModel } from './user.model';
import { MessageModel } from './message.model';

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
