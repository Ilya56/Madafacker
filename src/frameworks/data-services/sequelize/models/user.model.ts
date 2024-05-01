import {
  Model,
  Column,
  HasMany,
  IsUUID,
  PrimaryKey,
  Table,
  BelongsToMany,
  DataType,
  CreatedAt, UpdatedAt,
} from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { MessageModel } from './message.model';
import { IncomeUserMessagesModel } from './income-user-messages.model';

/**
 * This model represents user in the system. Please check entities first
 */
@Table
export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  /**
   * Unique uuid
   */
  @PrimaryKey
  @IsUUID('4')
  @Column(DataType.UUID)
  id: CreationOptional<string>;

  /**
   * User name
   */
  @Column
  name: string;

  /**
   * Outcome messages that were created by the user
   */
  @HasMany(() => MessageModel, 'authorId')
  outcomeMessages: NonAttribute<MessageModel[]>;

  /**
   * Income message from other users
   */
  @BelongsToMany(() => MessageModel, () => IncomeUserMessagesModel)
  incomeMessages: NonAttribute<MessageModel[]>;
}
