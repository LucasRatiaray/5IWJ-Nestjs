import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from './entities/artwork.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork])],
})
export class ArtworksModule {}
