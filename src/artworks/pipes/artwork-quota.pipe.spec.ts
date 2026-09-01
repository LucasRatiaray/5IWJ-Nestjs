import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArtworkQuotaPipe } from './artwork-quota.pipe';
import { Artwork } from '../entities/artwork.entity';
import { CreateArtworkDto } from '../dtos/create-artwork.dto';

const pipeWithCount = (count: number) => {
  const artworks = {
    count: jest.fn().mockResolvedValue(count),
  } as unknown as Repository<Artwork>;
  return new ArtworkQuotaPipe(artworks);
};

describe('ArtworkQuotaPipe', () => {
  const dto = { artistId: 'artist-1' } as CreateArtworkDto;

  it('passes the dto through when the artist is under the quota', async () => {
    await expect(pipeWithCount(49).transform(dto)).resolves.toBe(dto);
  });

  it('rejects when the artist already has 50 active artworks', async () => {
    await expect(pipeWithCount(50).transform(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
