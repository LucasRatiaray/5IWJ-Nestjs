import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dtos/create-artist.dto';
import { UpdateArtistDto } from './dtos/update-artist.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtPayload } from '../auth/types/jwt-payload';
import { Gallery } from '../galleries/entities/gallery.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private readonly repository: Repository<Artist>,
    @InjectRepository(Gallery) private readonly galleries: Repository<Gallery>,
  ) {}

  async create(dto: CreateArtistDto, user: JwtPayload) {
    const gallery = await this.galleryOf(user);
    const { joinedAt, ...rest } = dto;
    const artist = this.repository.create({
      ...rest,
      joinedAt: new Date(joinedAt),
      gallery,
    });
    return this.repository.save(artist);
  }

  findAllFor(user: JwtPayload) {
    if (user.role === UserRole.ADMIN) return this.repository.find();
    return this.repository.find({
      where: { gallery: { user: { id: user.sub } } },
    });
  }

  async findOneById(id: string) {
    const artist = await this.repository.findOneBy({ id });
    if (!artist) throw new NotFoundException(`Artist ${id} not found`);
    return artist;
  }

  async update(id: string, dto: UpdateArtistDto, user: JwtPayload) {
    const artist = await this.getOwned(id, user);
    Object.assign(artist, dto);
    return this.repository.save(artist);
  }

  async remove(id: string, user: JwtPayload) {
    const artist = await this.getOwned(id, user);
    await this.repository.remove(artist);
  }

  async transfer(id: string, toGalleryId: string) {
    await this.findOneById(id);
    await this.repository.update(id, { gallery: { id: toGalleryId } });
    return this.findOneById(id);
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

  private async getOwned(id: string, user: JwtPayload) {
    const artist = await this.repository.findOne({
      where: { id },
      relations: { gallery: { user: true } },
    });
    if (!artist) throw new NotFoundException(`Artist ${id} not found`);
    if (user.role !== UserRole.ADMIN && artist.gallery.user.id !== user.sub) {
      throw new ForbiddenException('This artist is not in your gallery');
    }
    return artist;
  }
}
