import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { BusinessRuleViolationException } from '../common/exceptions/business-rule-violation.exception';
import { Sale } from './entities/sale.entity';
import { ArtworkStatus } from '../artworks/enums/artwork-status.enum';
import { UserRole } from '../users/enums/user-role.enum';
import type { JwtPayload } from '../auth/types/jwt-payload';

describe('SalesService', () => {
  let service: SalesService;
  let manager: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: unknown;
  };

  const gallery: JwtPayload = { sub: 'user-1', role: UserRole.GALLERY };
  const dto = { artworkId: 'art-1', collectorId: 'col-1', salePrice: 3000 };

  const artworkFixture = (over: Record<string, unknown> = {}) => ({
    id: 'art-1',
    status: ArtworkStatus.AVAILABLE,
    reservePrice: '1000',
    gallery: { user: { id: 'user-1' } },
    ...over,
  });

  beforeEach(async () => {
    manager = {
      findOne: jest.fn(),
      findOneBy: jest.fn().mockResolvedValue({ id: 'col-1' }),
      create: jest.fn((_entity, value) => value),
      save: jest.fn((value) => Promise.resolve(value)),
    };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Sale), useValue: {} },
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => queryRunner },
        },
      ],
    }).compile();

    service = moduleRef.get(SalesService);
  });

  describe('commission tiers', () => {
    it.each([
      [3000, 0.4, 1200, 1800],
      [5000, 0.4, 2000, 3000],
      [10000, 0.35, 3500, 6500],
      [20000, 0.35, 7000, 13000],
      [25000, 0.3, 7500, 17500],
    ])(
      'price %d -> rate %d, commission %d, balance %d',
      async (price, rate, commission, balance) => {
        manager.findOne.mockResolvedValue(
          artworkFixture({ reservePrice: '0' }),
        );

        const sale = await service.create(
          { ...dto, salePrice: price },
          gallery,
        );

        expect(sale.commissionRate).toBe(rate);
        expect(sale.commissionAmount).toBe(commission);
        expect(sale.artistBalance).toBe(balance);
      },
    );
  });

  describe('create', () => {
    it('marks the artwork sold and commits', async () => {
      const artwork = artworkFixture();
      manager.findOne.mockResolvedValue(artwork);

      await service.create(dto, gallery);

      expect(artwork.status).toBe(ArtworkStatus.SOLD);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('throws 404 and rolls back when the artwork is missing', async () => {
      manager.findOne.mockResolvedValue(null);
      await expect(service.create(dto, gallery)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('throws 403 when the artwork is in another gallery', async () => {
      manager.findOne.mockResolvedValue(
        artworkFixture({ gallery: { user: { id: 'other' } } }),
      );
      await expect(service.create(dto, gallery)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws a business-rule violation when the artwork is not available', async () => {
      manager.findOne.mockResolvedValue(
        artworkFixture({ status: ArtworkStatus.ON_LOAN }),
      );
      await expect(service.create(dto, gallery)).rejects.toBeInstanceOf(
        BusinessRuleViolationException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    });

    it('throws a business-rule violation when the price is below the reserve', async () => {
      manager.findOne.mockResolvedValue(
        artworkFixture({ reservePrice: '5000' }),
      );
      await expect(service.create(dto, gallery)).rejects.toBeInstanceOf(
        BusinessRuleViolationException,
      );
    });

    it('throws 404 and rolls back when the collector is missing', async () => {
      manager.findOne.mockResolvedValue(artworkFixture());
      manager.findOneBy.mockResolvedValue(null);
      await expect(service.create(dto, gallery)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    });
  });
});
