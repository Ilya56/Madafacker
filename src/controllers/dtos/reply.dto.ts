import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { PublicMessageDto } from './message.dto';
import { Expose, Type } from 'class-transformer';

export class ReplyDto extends PublicMessageDto {
  @Expose()
  @Type(() => PublicMessageDto)
  parent: PublicMessageDto;

  @Expose()
  parentId: string;

  @Expose()
  public: boolean;
}

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsUUID()
  @IsNotEmpty()
  parentId: string;

  @IsBoolean()
  @IsNotEmpty()
  public: boolean;
}

export class UpdateReplyDto extends PickType(CreateReplyDto, ['public']) {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
