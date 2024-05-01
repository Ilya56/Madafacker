import { Model, Column, HasMany, IsUUID, PrimaryKey, Table, BelongsToMany, DataType } from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { MessageModel } from './message.model';
import { IncomeUserMessagesModel } from './income-user-messages.model';

@Table
export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  @PrimaryKey
  @IsUUID('4')
  @Column(DataType.UUID)
  id: CreationOptional<string>;

  @Column
  name: string;

  @HasMany(() => MessageModel, 'authorId')
  outcomeMessages: NonAttribute<MessageModel[]>;

  @BelongsToMany(() => MessageModel, () => IncomeUserMessagesModel)
  incomeMessages: NonAttribute<MessageModel[]>;
}
