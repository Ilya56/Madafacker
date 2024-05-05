import { IsBoolean, IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsNumberString()
  @IsNotEmpty()
  parentId: number;

  @IsBoolean()
  @IsNotEmpty()
  public: boolean;
}

export class UpdateReplyDto extends PickType(CreateReplyDto, ['public']) {}
