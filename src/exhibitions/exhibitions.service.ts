import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Exhibition } from './entities/exhibition.entity';
import { CreateExhibitionDto } from './dtos/create-exhibition.dto';
import { Artwork } from '../artworks/entities/artwork.entity';
import { Gallery } from '../galleries/entities/gallery.entity';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtPayload } from '../auth/types/jwt-payload';
import { changeArtworkStatus } from '../common/artworks/change-artwork-status';

@Injectable()
export class ExhibitionsService {
  constructor(
    @InjectRepository(Exhibition)
    private readonly repository: Repository<Exhibition>,
    @InjectRepository(Gallery)
    private readonly galleries: Repository<Gallery>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateExhibitionDto, user: JwtPayload) {
    const gallery = await this.galleryOf(user);

    if (new Date(dto.endDate) < new Date(dto.startDate))
      throw new BadRequestException('endDate cannot be before startDate');

    return this.dataSource.transaction(async (manager) => {
      const artworks = await manager.find(Artwork, {
        where: { id: In(dto.artworkIds) },
        relations: { gallery: true },
      });

      if (artworks.length !== dto.artworkIds.length) {
        throw new NotFoundException('Some artworks were not found');
      }

      for (const artwork of artworks) {
        if (artwork.gallery.id !== gallery.id) {
          throw new ForbiddenException(
            `Artwork ${artwork.id} is not in your gallery`,
          );
        }
        if (artwork.status !== ArtworkStatus.AVAILABLE) {
          throw new ConflictException(`Artwork ${artwork.id} is not available`);
        }
      }

      const exhibition = manager.create(Exhibition, {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        location: dto.location,
        gallery,
        artworks,
      });
      await manager.save(exhibition);

      for (const artwork of artworks) {
        await changeArtworkStatus(
          manager,
          artwork,
          ArtworkStatus.ON_LOAN,
          'exhibition',
        );
      }

      return exhibition;
    });
  }

  findAll() {
    return this.repository.find({ relations: { artworks: true } });
  }

  async findOneById(id: string) {
    const exhibition = await this.repository.findOne({
      where: { id },
      relations: { artworks: true },
    });
    if (!exhibition) throw new NotFoundException(`Exhibition ${id} not found`);
    return exhibition;
  }

  async remove(id: string, user: JwtPayload) {
    await this.dataSource.transaction(async (manager) => {
      const exhibition = await manager.findOne(Exhibition, {
        where: { id },
        relations: { gallery: { user: true }, artworks: true },
      });
      if (!exhibition) {
        throw new NotFoundException(`Exhibition ${id} not found`);
      }
      if (
        user.role !== UserRole.ADMIN &&
        exhibition.gallery.user.id !== user.sub
      ) {
        throw new ForbiddenException('This exhibition is not yours');
      }

      for (const artwork of exhibition.artworks) {
        if (artwork.status === ArtworkStatus.ON_LOAN) {
          await changeArtworkStatus(
            manager,
            artwork,
            ArtworkStatus.AVAILABLE,
            'exhibition-end',
          );
        }
      }

      await manager.remove(exhibition);
    });
  }

  private async galleryOf(user: JwtPayload) {
    const gallery = await this.galleries.findOne({
      where: { user: { id: user.sub } },
    });
    if (!gallery) {
      throw new ForbiddenException('No gallery attached to your account');
    }
    return gallery;
  }
}
