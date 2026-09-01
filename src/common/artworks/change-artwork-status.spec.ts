import { EntityManager } from 'typeorm';
import { changeArtworkStatus } from './change-artwork-status';
import { Artwork } from '../../artworks/entities/artwork.entity';
import { ArtworkStatus } from '../../artworks/enums/artwork-status.enum';
import { ArtworkStatusHistory } from '../../artwork-status-histories/entities/artwork-status-history.entity';

describe('changeArtworkStatus', () => {
  const makeManager = () => ({
    create: jest.fn((_entity, value) => value),
    save: jest.fn((value) => Promise.resolve(value)),
  });

  it('updates the status and records a history row', async () => {
    const artwork = { status: ArtworkStatus.AVAILABLE } as Artwork;
    const manager = makeManager();

    await changeArtworkStatus(
      manager as unknown as EntityManager,
      artwork,
      ArtworkStatus.SOLD,
      'sale',
    );

    expect(artwork.status).toBe(ArtworkStatus.SOLD);
    expect(manager.save).toHaveBeenCalledTimes(2);
    expect(manager.create).toHaveBeenCalledWith(ArtworkStatusHistory, {
      artwork,
      fromStatus: ArtworkStatus.AVAILABLE,
      toStatus: ArtworkStatus.SOLD,
      reason: 'sale',
    });
  });

  it('keeps the previous status as fromStatus and allows no reason', async () => {
    const artwork = { status: ArtworkStatus.ON_LOAN } as Artwork;
    const manager = makeManager();

    await changeArtworkStatus(
      manager as unknown as EntityManager,
      artwork,
      ArtworkStatus.AVAILABLE,
    );

    expect(manager.create).toHaveBeenCalledWith(ArtworkStatusHistory, {
      artwork,
      fromStatus: ArtworkStatus.ON_LOAN,
      toStatus: ArtworkStatus.AVAILABLE,
      reason: undefined,
    });
  });
});
