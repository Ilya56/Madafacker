import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  registrationToken: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
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
