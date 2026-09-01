import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateArtworkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  creationYear?: number;

  @IsString()
  @IsNotEmpty()
  technique: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  height?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  depth?: number;

  @IsNumber()
  @IsPositive()
  salePrice: number;

  @IsNumber()
  @IsPositive()
  reservePrice: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsUUID()
  artistId: string;

  @IsDateString()
  consignedAt: string;
}
