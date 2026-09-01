import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsDateString()
  joinedAt: string;

  @ValidateIf(
    (o: CreateArtistDto) => o.email !== undefined || o.password !== undefined,
  )
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email?: string;

  @ValidateIf(
    (o: CreateArtistDto) => o.email !== undefined || o.password !== undefined,
  )
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password?: string;
}
