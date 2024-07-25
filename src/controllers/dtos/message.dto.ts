import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageMode, MessageRating } from '@core';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(MessageMode)
  mode: MessageMode;
}

export class RatingDto {
  @IsNotEmpty()
  @IsEnum(MessageRating)
  rating: MessageRating;
}
