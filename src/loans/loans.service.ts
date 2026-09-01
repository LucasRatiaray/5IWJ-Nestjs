import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dtos/create-loan.dto';
import { Artwork } from '../artworks/entities/artwork.entity';
import { Gallery } from '../galleries/entities/gallery.entity';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtPayload } from '../auth/types/jwt-payload';
import { changeArtworkStatus } from '../common/artworks/change-artwork-status';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan) private readonly repository: Repository<Loan>,
    @InjectRepository(Gallery) private readonly galleries: Repository<Gallery>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateLoanDto, user: JwtPayload) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start)
      throw new BadRequestException('endDate cannot be before startDate');

    const destination = await this.galleries.findOneBy({
      id: dto.destinationGalleryId,
    });
    if (!destination)
      throw new NotFoundException(
        `Gallery ${dto.destinationGalleryId} not found`,
      );

    return this.dataSource.transaction(async (manager) => {
      const artwork = await manager.findOne(Artwork, {
        where: { id: dto.artworkId },
        relations: { gallery: { user: true } },
      });
      if (!artwork)
        throw new NotFoundException(`Artwork ${dto.artworkId} not found`);

      if (
        user.role !== UserRole.ADMIN &&
        artwork.gallery.user.id !== user.sub
      ) {
        throw new ForbiddenException('This artwork is not in your gallery');
      }

      if (artwork.gallery.id === destination.id) {
        throw new BadRequestException(
          'Source and destination galleries are the same',
        );
      }

      if (artwork.status !== ArtworkStatus.AVAILABLE)
        throw new ConflictException('Artwork is not available for loan');

      const overlap = await manager.findOne(Loan, {
        where: {
          artwork: { id: artwork.id },
          startDate: LessThanOrEqual(end),
          endDate: MoreThanOrEqual(start),
        },
      });
      if (overlap)
        throw new ConflictException(
          'Artwork already has a loan over this period',
        );

      const loan = manager.create(Loan, {
        artwork,
        sourceGallery: artwork.gallery,
        destinationGallery: destination,
        startDate: start,
        endDate: end,
        conditions: dto.conditions,
      });
      await manager.save(loan);

      await changeArtworkStatus(
        manager,
        artwork,
        ArtworkStatus.ON_LOAN,
        'loan',
      );

      return loan;
    });
  }

  findAllFor(user: JwtPayload) {
    if (user.role === UserRole.ADMIN) return this.repository.find();
    return this.repository.find({
      where: [
        { sourceGallery: { user: { id: user.sub } } },
        { destinationGallery: { user: { id: user.sub } } },
      ],
    });
  }

  async findOneFor(id: string, user: JwtPayload) {
    const loan = await this.repository.findOne({
      where: { id },
      relations: {
        sourceGallery: { user: true },
        destinationGallery: { user: true },
      },
    });
    if (!loan || !this.isInvolved(loan, user))
      throw new NotFoundException(`Loan ${id} not found`);
    return loan;
  }

  async return(id: string, user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const loan = await manager.findOne(Loan, {
        where: { id },
        relations: {
          artwork: true,
          sourceGallery: { user: true },
          destinationGallery: { user: true },
        },
      });
      if (!loan) throw new NotFoundException(`Loan ${id} not found`);
      if (!this.isInvolved(loan, user)) {
        throw new ForbiddenException('This loan is not yours');
      }

      if (loan.artwork.status === ArtworkStatus.ON_LOAN) {
        await changeArtworkStatus(
          manager,
          loan.artwork,
          ArtworkStatus.AVAILABLE,
          'loan-return',
        );
      }

      return loan;
    });
  }

  private isInvolved(loan: Loan, user: JwtPayload) {
    return (
      user.role === UserRole.ADMIN ||
      loan.sourceGallery.user.id === user.sub ||
      loan.destinationGallery.user.id === user.sub
    );
  }
}
