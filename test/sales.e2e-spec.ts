import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Gallery } from '../src/galleries/entities/gallery.entity';
import { Artist } from '../src/artists/entities/artist.entity';
import { Artwork } from '../src/artworks/entities/artwork.entity';
import { Collector } from '../src/collectors/entities/collector.entity';
import { UserRole } from '../src/users/enums/user-role.enum';
import { ArtworkStatus } from '../src/artworks/enums/artwork-status.enum';
import { hashPassword } from '../src/common/security/password.util';

describe('POST /sales (e2e)', () => {
  let app: INestApplication;
  let artworks: Repository<Artwork>;

  let token: string;
  let artworkId: string;
  let collectorId: string;

  const PASSWORD = 'e2e-Passw0rd!';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const users = app.get<Repository<User>>(getRepositoryToken(User));
    const galleries = app.get<Repository<Gallery>>(getRepositoryToken(Gallery));
    const artists = app.get<Repository<Artist>>(getRepositoryToken(Artist));
    artworks = app.get<Repository<Artwork>>(getRepositoryToken(Artwork));
    const collectors = app.get<Repository<Collector>>(
      getRepositoryToken(Collector),
    );

    const stamp = Date.now();
    const password = await hashPassword(PASSWORD);

    const galleryUser = await users.save(
      users.create({
        email: `e2e-sale-${stamp}@test.com`,
        password,
        role: UserRole.GALLERY,
        isActive: true,
      }),
    );
    const gallery = await galleries.save(
      galleries.create({ name: `E2E ${stamp}`, user: galleryUser }),
    );
    const artist = await artists.save(
      artists.create({
        firstName: 'E2E',
        lastName: 'Artist',
        joinedAt: new Date(),
        gallery,
      }),
    );
    const artwork = await artworks.save(
      artworks.create({
        title: 'E2E piece',
        technique: 'oil',
        salePrice: 5000,
        reservePrice: 1000,
        consignedAt: new Date(),
        status: ArtworkStatus.AVAILABLE,
        gallery,
        artist,
      }),
    );
    artworkId = artwork.id;

    const buyerUser = await users.save(
      users.create({
        email: `e2e-buyer-${stamp}@test.com`,
        password,
        role: UserRole.COLLECTOR,
        isActive: true,
      }),
    );
    const collector = await collectors.save(
      collectors.create({ firstName: 'Buy', lastName: 'Er', user: buyerUser }),
    );
    collectorId = collector.id;

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: galleryUser.email, password: PASSWORD })
      .expect(200);
    token = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('records a sale end to end (validation -> guard -> service -> transaction)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ artworkId, collectorId, salePrice: 3000 })
      .expect(201);

    expect(res.body.data.commissionRate).toBe(0.4);
    expect(res.body.data.commissionAmount).toBe(1200);
    expect(res.body.data.artistBalance).toBe(1800);

    const stored = await artworks.findOneBy({ id: artworkId });
    expect(stored?.status).toBe(ArtworkStatus.SOLD);
  });

  it('rejects a second sale of the same artwork (409)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ artworkId, collectorId, salePrice: 3000 })
      .expect(409);
  });
});
