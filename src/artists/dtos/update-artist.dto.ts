import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ArtistStatus } from '../enums/artist-status.enum';

export class UpdateArtistDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsEnum(ArtistStatus)
  status?: ArtistStatus;
}
