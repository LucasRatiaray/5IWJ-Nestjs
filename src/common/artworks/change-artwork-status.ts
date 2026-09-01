import { EntityManager } from 'typeorm';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { ArtworkStatus } from '../../artworks/enums/artwork-status.enum';
import { ArtworkStatusHistory } from '../../artwork-status-histories/entities/artwork-status-history.entity';

export async function changeArtworkStatus(
  manager: EntityManager,
  artwork: Artwork,
  to: ArtworkStatus,
  reason?: string,
) {
  const fromStatus = artwork.status;
  artwork.status = to;
  await manager.save(artwork);
  await manager.save(
    manager.create(ArtworkStatusHistory, {
      artwork,
      fromStatus,
      toStatus: to,
      reason,
    }),
  );
}
