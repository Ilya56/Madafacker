import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { PublicMessageDto } from './message.dto';

export class PrivateUserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => PublicMessageDto)
  incomeMessages: PublicMessageDto[];

  @Expose()
  @Type(() => PublicMessageDto)
  outcomeMessages: PublicMessageDto[];

  @Expose()
  coins: number;

  @Expose()
  registrationToken: string;

  @Expose()
  tokenIsInvalid: boolean;

  @Expose()
  authProviderId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class PublicUserDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(1000)
  registrationToken?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  registrationToken?: string;
}

export class CheckNameAvailableDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class NameIsAvailableResponseDto {
  @Expose()
  nameIsAvailable: boolean;
}
