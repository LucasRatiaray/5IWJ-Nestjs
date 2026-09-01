import { IsUUID } from 'class-validator';

export class TransferArtistDto {
  @IsUUID()
  toGalleryId: string;
}
