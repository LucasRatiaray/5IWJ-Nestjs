import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { JwtPayload } from '../auth/types/jwt-payload';
import { Artwork } from '../artworks/entities/artwork.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { Collector } from '../collectors/entities/collector.entity';
import { ArtworkStatusHistory } from '../artwork-status-histories/entities/artwork-status-history.entity';
import { Sale } from './entities/sale.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { ArtistStatement } from '../artist-statements/entities/artist-statement.entity';
import { InjectRepository } from '@nestjs/typeorm';

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private readonly repository: Repository<Sale>,
    private readonly dataSource: DataSource,
  ) {}

  private commissionRate(price: number) {
    if (price <= 5000) return 0.4;
    if (price <= 20000) return 0.35;
    return 0.3;
  }

  async create(dto: CreateSaleDto, user: JwtPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const artwork = await queryRunner.manager.findOne(Artwork, {
        where: { id: dto.artworkId },
        relations: { gallery: { user: true } },
      });

      if (!artwork)
        throw new NotFoundException(`Artwork ${dto.artworkId} not found`);

      if (user.role !== UserRole.ADMIN && artwork.gallery.user.id !== user.sub)
        throw new ForbiddenException('This artwork is not in your gallery');

      if (artwork.status !== ArtworkStatus.AVAILABLE)
        throw new ConflictException('Artwork is not available for sale');

      if (dto.salePrice < Number(artwork.reservePrice))
        throw new BadRequestException('Sale price is below the reserve price');

      const collector = await queryRunner.manager.findOneBy(Collector, {
        id: dto.collectorId,
      });
      if (!collector)
        throw new NotFoundException(`Collector ${dto.collectorId} not found`);

      const rate = this.commissionRate(dto.salePrice);
      const commissionAmount = round2(dto.salePrice * rate);
      const artistBalance = round2(dto.salePrice - commissionAmount);

      const fromStatus = artwork.status;
      artwork.status = ArtworkStatus.SOLD;
      await queryRunner.manager.save(artwork);
      await queryRunner.manager.save(
        queryRunner.manager.create(ArtworkStatusHistory, {
          artwork,
          fromStatus,
          toStatus: ArtworkStatus.SOLD,
          reason: 'sale',
        }),
      );

      const sale = queryRunner.manager.create(Sale, {
        artwork,
        collector,
        salePrice: dto.salePrice,
        commissionRate: rate,
        commissionAmount,
        artistBalance,
      });
      await queryRunner.manager.save(sale);

      await queryRunner.manager.save(
        queryRunner.manager.create(Invoice, { sale, amount: dto.salePrice }),
      );
      await queryRunner.manager.save(
        queryRunner.manager.create(ArtistStatement, {
          sale,
          amount: artistBalance,
        }),
      );

      await queryRunner.commitTransaction();

      return sale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAllFor(user: JwtPayload) {
    return this.repository.find({ where: this.scopeFor(user) });
  }

  async findOneFor(id: string, user: JwtPayload) {
    const sale = await this.repository.findOne({
      where: { id, ...this.scopeFor(user) },
    });
    if (!sale) throw new NotFoundException(`Sale ${id} not found`);
    return sale;
  }

  private scopeFor(user: JwtPayload): FindOptionsWhere<Sale> {
    switch (user.role) {
      case UserRole.ADMIN:
        return {};
      case UserRole.GALLERY:
        return { artwork: { gallery: { user: { id: user.sub } } } };
      case UserRole.ARTIST:
        return { artwork: { artist: { user: { id: user.sub } } } };
      default:
        return { collector: { user: { id: user.sub } } };
    }
  }
}
