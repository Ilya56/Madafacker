import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  registrationToken: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

export class CheckNameAvailableDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class NameIsAvailableResponseDto {
  nameIsAvailable: boolean;
}
