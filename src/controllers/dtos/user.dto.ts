import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateUserDto extends CreateUserDto {}

export class CheckNameAvailableDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class NameIsAvailableResponseDto {
  nameIsAvailable: boolean;
}
