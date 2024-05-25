import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';

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

export class UpdateReplyDto extends PickType(CreateReplyDto, ['public']) {}
