import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password: string;

  @IsIn([UserRole.GALLERY, UserRole.COLLECTOR])
  role: UserRole;

  @ValidateIf((o: RegisterDto) => o.role === UserRole.GALLERY)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
