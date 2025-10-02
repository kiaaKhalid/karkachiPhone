import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  // Required optimistic locking version from the client
  @IsInt()
  @Min(0)
  version!: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]*$/u, {
    message:
      'phone must be a valid phone number (digits, spaces, dashes, optional country code)',
  })
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;
}
