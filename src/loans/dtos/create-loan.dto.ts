import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLoanDto {
  @IsUUID()
  artworkId: string;

  @IsUUID()
  destinationGalleryId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  conditions?: string;
}
