import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestStatus } from './enums/purchase-request-status.enum';
import { CreatePurchaseRequestDto } from './dtos/create-purchase-request.dto';
import { SalesService } from './sales.service';
import { Artwork } from '../artworks/entities/artwork.entity';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { Collector } from '../collectors/entities/collector.entity';
import { UserRole } from '../users/enums/user-role.enum';
import type { JwtPayload } from '../auth/types/jwt-payload';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly repository: Repository<PurchaseRequest>,
    @InjectRepository(Artwork) private readonly artworks: Repository<Artwork>,
    @InjectRepository(Collector)
    private readonly collectors: Repository<Collector>,
    private readonly salesService: SalesService,
  ) {}

  async create(dto: CreatePurchaseRequestDto, user: JwtPayload) {
    const collector = await this.collectors.findOne({
      where: { user: { id: user.sub } },
    });
    if (!collector)
      throw new ForbiddenException('No collector profile on your account');

    const artwork = await this.artworks.findOneBy({ id: dto.artworkId });
    if (!artwork)
      throw new NotFoundException(`Artwork ${dto.artworkId} not found`);
    if (artwork.status !== ArtworkStatus.AVAILABLE)
      throw new ConflictException('Artwork is not available');

    return this.repository.save(
      this.repository.create({
        collector,
        artwork,
        status: PurchaseRequestStatus.PENDING,
      }),
    );
  }

  findAllFor(user: JwtPayload) {
    const where = this.scopeFor(user);
    if (!where) return Promise.resolve([]);
    return this.repository.find({ where });
  }

  async confirm(id: string, user: JwtPayload) {
    const request = await this.getPending(id);
    const sale = await this.salesService.create(
      {
        artworkId: request.artwork.id,
        collectorId: request.collector.id,
        salePrice: Number(request.artwork.salePrice),
      },
      user,
    );
    request.status = PurchaseRequestStatus.CONFIRMED;
    await this.repository.save(request);
    return sale;
  }

  async reject(id: string, user: JwtPayload) {
    const request = await this.getPending(id);
    if (
      user.role !== UserRole.ADMIN &&
      request.artwork.gallery.user.id !== user.sub
    )
      throw new ForbiddenException('This artwork is not in your gallery');
    request.status = PurchaseRequestStatus.REJECTED;
    return this.repository.save(request);
  }

  private async getPending(id: string) {
    const request = await this.repository.findOne({
      where: { id },
      relations: { artwork: { gallery: { user: true } }, collector: true },
    });
    if (!request)
      throw new NotFoundException(`Purchase request ${id} not found`);
    if (request.status !== PurchaseRequestStatus.PENDING)
      throw new ConflictException(
        `Purchase request ${id} is already ${request.status}`,
      );
    return request;
  }

  private scopeFor(user: JwtPayload): FindOptionsWhere<PurchaseRequest> | null {
    switch (user.role) {
      case UserRole.ADMIN:
        return {};
      case UserRole.GALLERY:
        return { artwork: { gallery: { user: { id: user.sub } } } };
      case UserRole.COLLECTOR:
        return { collector: { user: { id: user.sub } } };
      default:
        return null;
    }
  }
}
