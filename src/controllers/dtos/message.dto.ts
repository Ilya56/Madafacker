import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MessageMode, MessageRating } from '@core';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body: string;

  @IsEnum(MessageMode)
  mode: MessageMode;
}

export class RatingDto {
  @IsNotEmpty()
  @IsEnum(MessageRating)
  rating: MessageRating;
}
