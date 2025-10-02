import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'oldPassword is required' })
  oldPassword!: string;

  @IsString()
  @MinLength(8, { message: 'newPassword must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'newPassword must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'newPassword must contain a digit' })
  @Matches(/[^A-Za-z0-9]/, { message: 'newPassword must contain a symbol' })
  newPassword!: string;
}
