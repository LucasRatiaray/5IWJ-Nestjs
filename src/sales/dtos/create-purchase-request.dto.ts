import { IsUUID } from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsUUID()
  artworkId: string;
}
