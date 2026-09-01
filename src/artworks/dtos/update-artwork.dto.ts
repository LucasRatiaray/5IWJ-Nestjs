import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class UpdateArtworkDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  creationYear?: number;

  @IsOptional()
  @IsString()
  technique?: string;

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

  @IsOptional()
  @IsNumber()
  @IsPositive()
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  reservePrice?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
