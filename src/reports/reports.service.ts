import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Artwork } from '../artworks/entities/artwork.entity';
import { Artist } from '../artists/entities/artist.entity';
import { Gallery } from '../galleries/entities/gallery.entity';
import { User } from '../users/entities/user.entity';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale) private readonly sales: Repository<Sale>,
    @InjectRepository(Artwork) private readonly artworks: Repository<Artwork>,
    @InjectRepository(Artist) private readonly artists: Repository<Artist>,
    @InjectRepository(Gallery) private readonly galleries: Repository<Gallery>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async galleryDashboard(userId: string) {
    const gallery = await this.galleries.findOne({
      where: { user: { id: userId } },
    });
    if (!gallery) {
      throw new ForbiddenException('No gallery attached to your account');
    }

    const parMois = await this.gallerySales(gallery.id)
      .select("to_char(date_trunc('month', sale.soldAt), 'YYYY-MM')", 'mois')
      .addSelect('COUNT(*)', 'nombre')
      .groupBy("date_trunc('month', sale.soldAt)")
      .orderBy("date_trunc('month', sale.soldAt)", 'ASC')
      .getRawMany<{ mois: string; nombre: string }>();

    const ca = await this.gallerySales(gallery.id)
      .select('COALESCE(SUM(sale.salePrice), 0)', 'total')
      .getRawOne<{ total: string }>();

    const topArtistes = await this.gallerySales(gallery.id)
      .innerJoin('artwork.artist', 'artist')
      .select('artwork.artistId', 'artisteId')
      .addSelect('artist.firstName', 'prenom')
      .addSelect('artist.lastName', 'nom')
      .addSelect('COALESCE(SUM(sale.salePrice), 0)', 'totalVentes')
      .groupBy('artwork.artistId')
      .addGroupBy('artist.firstName')
      .addGroupBy('artist.lastName')
      .orderBy('COALESCE(SUM(sale.salePrice), 0)', 'DESC')
      .limit(5)
      .getRawMany<{
        artisteId: string;
        prenom: string;
        nom: string;
        totalVentes: string;
      }>();

    const venduesRow = await this.gallerySales(gallery.id)
      .select('COUNT(DISTINCT sale.artworkId)', 'vendues')
      .getRawOne<{ vendues: string }>();
    const vendues = Number(venduesRow?.vendues ?? 0);
    const totalOeuvres = await this.artworks.count({
      where: { gallery: { id: gallery.id } },
    });

    return {
      ventesParMois: parMois.map((r) => ({
        mois: r.mois,
        nombre: Number(r.nombre),
      })),
      chiffreAffaires: Number(ca?.total ?? 0),
      top5Artistes: topArtistes.map((r) => ({
        artisteId: r.artisteId,
        prenom: r.prenom,
        nom: r.nom,
        totalVentes: Number(r.totalVentes),
      })),
      tauxRotation: totalOeuvres === 0 ? 0 : round2(vendues / totalOeuvres),
    };
  }

  async artistDashboard(userId: string) {
    const artist = await this.artists.findOne({
      where: { user: { id: userId } },
    });
    if (!artist) {
      throw new ForbiddenException(
        'No artist profile attached to your account',
      );
    }

    const totaux = await this.sales
      .createQueryBuilder('sale')
      .innerJoin('sale.artwork', 'artwork')
      .where('artwork.artistId = :artistId', { artistId: artist.id })
      .select('COALESCE(SUM(sale.salePrice), 0)', 'totalVentes')
      .addSelect('COALESCE(SUM(sale.commissionAmount), 0)', 'commissions')
      .getRawOne<{ totalVentes: string; commissions: string }>();

    const oeuvresDisponibles = await this.artworks.count({
      where: { artist: { id: artist.id }, status: ArtworkStatus.AVAILABLE },
    });

    return {
      totalVentes: Number(totaux?.totalVentes ?? 0),
      commissionsVersees: Number(totaux?.commissions ?? 0),
      oeuvresDisponibles,
    };
  }

  async adminDashboard() {
    const utilisateursActifs = await this.users.count({
      where: { isActive: true },
    });

    const row = await this.sales
      .createQueryBuilder('sale')
      .select('COUNT(*)', 'volume')
      .addSelect('COALESCE(SUM(sale.commissionAmount), 0)', 'commissions')
      .getRawOne<{ volume: string; commissions: string }>();

    return {
      utilisateursActifs,
      volumeTransactions: Number(row?.volume ?? 0),
      commissionsPlateforme: Number(row?.commissions ?? 0),
    };
  }

  private gallerySales(galleryId: string) {
    return this.sales
      .createQueryBuilder('sale')
      .innerJoin('sale.artwork', 'artwork')
      .where('artwork.galleryId = :galleryId', { galleryId });
  }
}
