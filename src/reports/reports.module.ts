import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { Artist } from '../artists/entities/artist.entity';
import { Gallery } from '../galleries/entities/gallery.entity';
import { User } from '../users/entities/user.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Artwork, Artist, Gallery, User])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
