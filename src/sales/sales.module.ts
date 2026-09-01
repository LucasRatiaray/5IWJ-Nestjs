import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Artwork } from '../artworks/entities/artwork.entity';
import { Collector } from '../collectors/entities/collector.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { ArtistStatement } from '../artist-statements/entities/artist-statement.entity';
import { ArtworkStatusHistory } from '../artwork-status-histories/entities/artwork-status-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      Artwork,
      Collector,
      Invoice,
      ArtistStatement,
      ArtworkStatusHistory,
    ]),
  ],
  providers: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}
