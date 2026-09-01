import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateSaleDto {
  @IsUUID()
  artworkId: string;

  @IsUUID()
  collectorId: string;

  @IsNumber()
  @IsPositive()
  salePrice: number;
}
