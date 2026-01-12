import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MessageMode, MessageRating } from '@core';
import { Expose, Type } from 'class-transformer';
import { PublicUserDto } from './user.dto';

export class MessageRatingStatsDto {
  @Expose()
  likes: number;

  @Expose()
  dislikes: number;

  @Expose()
  superLikes: number;
}

export class PrivateMessageDto {
  @Expose()
  id: string;

  @Expose()
  body: string;

  @Expose()
  @Type(() => PublicUserDto)
  author: PublicUserDto;

  @Expose()
  mode: MessageMode;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => MessageRatingStatsDto)
  ratingStats?: MessageRatingStatsDto;

  @Expose()
  ownRating?: MessageRating | null;

  @Expose()
  @Type(() => PrivateMessageDto)
  replies: PrivateMessageDto[];
}

export class PublicMessageDto {
  @Expose()
  id: string;

  @Expose()
  body: string;

  @Expose()
  @Type(() => PublicUserDto)
  author: PublicUserDto;

  @Expose()
  mode: MessageMode;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => MessageRatingStatsDto)
  ratingStats?: MessageRatingStatsDto;

  @Expose()
  ownRating?: MessageRating | null;

  @Expose()
  @Type(() => PublicMessageDto)
  replies: PublicMessageDto[];
}

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
