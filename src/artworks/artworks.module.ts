import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from './entities/artwork.entity';
import { Artist } from '../artists/entities/artist.entity';
import { ArtworkStatusHistory } from '../artwork-status-histories/entities/artwork-status-history.entity';
import { ArtworksService } from './artworks.service';
import { ArtworksController } from './artworks.controller';
import { ArtworkQuotaPipe } from './pipes/artwork-quota.pipe';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, Artist, ArtworkStatusHistory])],
  providers: [ArtworksService, ArtworkQuotaPipe],
  controllers: [ArtworksController],
})
export class ArtworksModule {}
