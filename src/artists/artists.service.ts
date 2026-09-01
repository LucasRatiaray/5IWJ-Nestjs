import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dtos/create-artist.dto';
import { UpdateArtistDto } from './dtos/update-artist.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtPayload } from '../auth/types/jwt-payload';
import { Gallery } from '../galleries/entities/gallery.entity';
import { User } from '../users/entities/user.entity';
import { hashPassword } from '../common/security/password.util';
import { isUniqueViolation } from '../common/database/postgres-errors';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) private readonly repository: Repository<Artist>,
    @InjectRepository(Gallery) private readonly galleries: Repository<Gallery>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateArtistDto, user: JwtPayload) {
    const gallery = await this.galleryOf(user);
    const { joinedAt, email, password, ...rest } = dto;
    const attrs = { ...rest, joinedAt: new Date(joinedAt), gallery };

    if (!email || !password) {
      return this.repository.save(this.repository.create(attrs));
    }

    const passwordHash = await hashPassword(password);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const account = await manager.save(
          manager.create(User, {
            email,
            password: passwordHash,
            role: UserRole.ARTIST,
            isActive: true,
          }),
        );
        return manager.save(
          manager.create(Artist, { ...attrs, user: account }),
        );
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
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
