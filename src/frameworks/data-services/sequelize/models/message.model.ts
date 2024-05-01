import { BelongsTo, Column, IsUUID, PrimaryKey, Table, Model, DataType, Default } from 'sequelize-typescript';
import { MessageMode } from '../../../../core';
import { UserModel } from './user.model';
import { InferAttributes, InferCreationAttributes, NonAttribute, ForeignKey, CreationOptional } from 'sequelize';

@Table
export class MessageModel extends Model<InferAttributes<MessageModel>, InferCreationAttributes<MessageModel>> {
  @PrimaryKey
  @IsUUID('4')
  @Column({ unique: true })
  id: string;

  @Column
  body: string;

  @BelongsTo(() => UserModel)
  authorId: ForeignKey<UserModel['id']>;
  author: NonAttribute<UserModel>;

  @Column({
    type: DataType.ENUM(...Object.values(MessageMode)),
  })
  mode: MessageMode;

  @BelongsTo(() => MessageModel)
  parentId: ForeignKey<MessageModel['id']>;
  parent: NonAttribute<MessageModel>;

  @Column
  @Default(true)
  public: CreationOptional<boolean>;
}
