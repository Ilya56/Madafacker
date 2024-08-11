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
  ForeignKey as ForeignKeyDecorator,
  NotEmpty,
} from 'sequelize-typescript';
import { MessageMode } from '@core';
import { UserModel } from './user.model';
import { InferAttributes, InferCreationAttributes, NonAttribute, ForeignKey, CreationOptional } from 'sequelize';

/**
 * This model represents a message and reply-message in the system. Please check entities first
 */
@Table
export class MessageModel extends Model<InferAttributes<MessageModel>, InferCreationAttributes<MessageModel>> {
  /**
   * Unique uuid
   */
  @PrimaryKey
  @IsUUID('4')
  @Default(DataType.UUIDV4)
  @Column({ unique: true, type: DataType.UUIDV4 })
  id: CreationOptional<string>;

  /**
   * Message body
   */
  @NotEmpty
  @Column({
    allowNull: false,
  })
  body: string;

  /**
   * Message author id to store in DB and non-attribute to get author as usual user from the message model
   */
  @ForeignKeyDecorator(() => UserModel)
  authorId: ForeignKey<UserModel['id']>;
  @BelongsTo(() => UserModel)
  author: NonAttribute<UserModel>;

  /**
   * Message mode
   */
  @Column({
    type: DataType.ENUM(...Object.values(MessageMode)),
    allowNull: false,
  })
  mode: MessageMode;

  /**
   * Message parent id and parent message object
   */
  @ForeignKeyDecorator(() => MessageModel)
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
  @Column({ type: DataType.BOOLEAN, allowNull: false })
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

  /**
   * Mark that message already was sent to all users and no need to process this message again
   */
  @Default(false)
  @Column(DataType.BOOLEAN)
  wasSent: CreationOptional<boolean>;
}
