import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageMode } from '@core';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(MessageMode)
  mode: MessageMode;
}
