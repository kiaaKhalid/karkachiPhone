import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  @Length(8, 100)
  password: string;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
