import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { Artwork } from './entities/artwork.entity';
import { Artist } from '../artists/entities/artist.entity';
import { ArtworkStatusHistory } from '../artwork-status-histories/entities/artwork-status-history.entity';
import { ArtworkStatus } from './enums/artwork-status.enum';
import { CreateArtworkDto } from './dtos/create-artwork.dto';
import { UpdateArtworkDto } from './dtos/update-artwork.dto';
import { UserRole } from '../users/enums/user-role.enum';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Injectable()
export class ArtworksService {
  constructor(
    @InjectRepository(Artwork) private readonly repository: Repository<Artwork>,
    @InjectRepository(Artist) private readonly artists: Repository<Artist>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateArtworkDto, user: JwtPayload) {
    if (dto.reservePrice > dto.salePrice) {
      throw new BadRequestException('reservePrice cannot exceed salePrice');
    }

    const artist = await this.artists.findOne({
      where: { id: dto.artistId },
      relations: { gallery: { user: true } },
    });

    if (!artist)
      throw new NotFoundException(`Artist ${dto.artistId} not found`);

    if (user.role !== UserRole.ADMIN && artist.gallery.user.id !== user.sub) {
      throw new ForbiddenException('This artist is not in your gallery');
    }

    const { artistId, consignedAt, ...rest } = dto;

    return this.dataSource.transaction(async (manager) => {
      const artwork = manager.create(Artwork, {
        ...rest,
        consignedAt: new Date(consignedAt),
        artist,
        gallery: artist.gallery,
        status: ArtworkStatus.AVAILABLE,
      });
      await manager.save(artwork);

      await manager.save(
        manager.create(ArtworkStatusHistory, {
          artwork,
          fromStatus: null,
          toStatus: ArtworkStatus.AVAILABLE,
        }),
      );

      return artwork;
    });
  }

  findAll(consignedAfter?: Date) {
    return this.repository.find({
      where: consignedAfter
        ? { consignedAt: MoreThanOrEqual(consignedAfter) }
        : {},
    });
  }

  async findOneById(id: string) {
    const artwork = await this.repository.findOneBy({ id });
    if (!artwork) throw new NotFoundException(`Artwork ${id} not found`);
    return artwork;
  }

  async update(id: string, dto: UpdateArtworkDto, user: JwtPayload) {
    const artwork = await this.getOwned(id, user);
    const salePrice = dto.salePrice ?? artwork.salePrice;
    const reservePrice = dto.reservePrice ?? artwork.reservePrice;
    if (Number(reservePrice) > Number(salePrice)) {
      throw new BadRequestException('reservePrice cannot exceed salePrice');
    }
    Object.assign(artwork, dto);
    return this.repository.save(artwork);
  }

  async remove(id: string, user: JwtPayload) {
    const artwork = await this.getOwned(id, user);
    await this.repository.remove(artwork);
  }

  private async getOwned(id: string, user: JwtPayload) {
    const artwork = await this.repository.findOne({
      where: { id },
      relations: { gallery: { user: true } },
    });
    if (!artwork) throw new NotFoundException(`Artwork ${id} not found`);
    if (user.role !== UserRole.ADMIN && artwork.gallery.user.id !== user.sub) {
      throw new ForbiddenException('This artwork is not in your gallery');
    }
    return artwork;
  }
}
