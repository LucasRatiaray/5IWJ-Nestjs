import { Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artwork } from '../entities/artwork.entity';
import { Repository } from 'typeorm';
import { ArtworkStatus } from '../enums/artwork-status.enum';
import { CreateArtworkDto } from '../dtos/create-artwork.dto';
import { BusinessRuleViolationException } from '../../common/exceptions/business-rule-violation.exception';

const MAX_ACTIVE_ARTWORKS = 50;

@Injectable()
export class ArtworkQuotaPipe implements PipeTransform<CreateArtworkDto> {
  constructor(
    @InjectRepository(Artwork) private readonly artworks: Repository<Artwork>,
  ) {}

  async transform(dto: CreateArtworkDto) {
    const active = await this.artworks.count({
      where: {
        artist: { id: dto.artistId },
        status: ArtworkStatus.AVAILABLE,
      },
    });
    if (active >= MAX_ACTIVE_ARTWORKS) {
      throw new BusinessRuleViolationException(
        `Artist already has ${MAX_ACTIVE_ARTWORKS} active artworks`,
      );
    }
    return dto;
  }
}
