import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { Gallery } from '../galleries/entities/gallery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Gallery])],
  providers: [ArtistsService],
  controllers: [ArtistsController],
})
export class ArtistsModule {}
