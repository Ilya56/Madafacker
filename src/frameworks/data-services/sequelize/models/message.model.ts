import {
  BelongsTo,
  Column,
  IsUUID,
  PrimaryKey,
  Table,
  Model,
  DataType,
  Default,
  HasMany,
  HasOne,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { MessageMode } from '../../../../core';
import { UserModel } from './user.model';
import { InferAttributes, InferCreationAttributes, NonAttribute, ForeignKey, CreationOptional } from 'sequelize';

/**
 * This model represents message and replied message in the system. Please check entities first
 */
@Table
export class MessageModel extends Model<InferAttributes<MessageModel>, InferCreationAttributes<MessageModel>> {
  /**
   * Unique uuid
   */
  @PrimaryKey
  @IsUUID('4')
  @Column({ unique: true })
  id: string;

  /**
   * Message body
   */
  @Column
  body: string;

  /**
   * Message author id to store in DB and non-attribute to get author as usual user from the message model
   */
  @BelongsTo(() => UserModel)
  authorId: ForeignKey<UserModel['id']>;
  author: NonAttribute<UserModel>;

  /**
   * Message mode
   */
  @Column({
    type: DataType.ENUM(...Object.values(MessageMode)),
  })
  mode: MessageMode;

  /**
   * Message parent id and parent message object
   */
  @BelongsTo(() => MessageModel)
  parentId: ForeignKey<MessageModel['id']>;

  @HasOne(() => MessageModel)
  parent: NonAttribute<MessageModel>;

  /**
   * Message replies based on the parent id
   */
  @HasMany(() => MessageModel, 'parentId')
  replies: NonAttribute<MessageModel[]>;

  /**
   * Message mode
   */
  @Default(true)
  @Column(DataType.BOOLEAN)
  public: CreationOptional<boolean>;

  /**
   * When a message was created
   */
  @CreatedAt
  createdAt: CreationOptional<Date>;

  /**
   * When a message was updated
   */
  @UpdatedAt
  updatedAt?: Date;
}
