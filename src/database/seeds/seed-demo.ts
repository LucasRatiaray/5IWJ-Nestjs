import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { ArtistsService } from '../../artists/artists.service';
import { ArtworksService } from '../../artworks/artworks.service';
import { PurchaseRequestsService } from '../../sales/purchase-requests.service';
import { SalesService } from '../../sales/sales.service';
import { ExhibitionsService } from '../../exhibitions/exhibitions.service';
import { LoansService } from '../../loans/loans.service';
import { Gallery } from '../../galleries/entities/gallery.entity';
import { Collector } from '../../collectors/entities/collector.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import type { JwtPayload } from '../../auth/types/jwt-payload';

const GALLERY_LUMIERE = {
  email: 'galerie-lumiere@consignart.test',
  password: 'galerie-password-123',
  name: 'Galerie Lumière',
};

const GALLERY_HORIZON = {
  email: 'galerie-horizon@consignart.test',
  password: 'horizon-password-123',
  name: 'Galerie Horizon',
};

const ARTIST_PASSWORD = 'artiste-password-123';

const ARTISTS = {
  frida: {
    email: 'frida@consignart.test',
    firstName: 'Frida',
    lastName: 'Kahlo',
    nationality: 'MX',
    joinedAt: '2026-02-01',
  },
  soulages: {
    email: 'pierre@consignart.test',
    firstName: 'Pierre',
    lastName: 'Soulages',
    nationality: 'FR',
    joinedAt: '2026-01-15',
  },
  basquiat: {
    email: 'jean@consignart.test',
    firstName: 'Jean-Michel',
    lastName: 'Basquiat',
    nationality: 'US',
    joinedAt: '2026-03-10',
  },
};

const COLLECTOR = {
  email: 'camille@consignart.test',
  password: 'collector-password-123',
  firstName: 'Camille',
  lastName: 'Durand',
};

type GalleryCreds = { email: string; password: string; name: string };
type SeededGallery = { payload: JwtPayload; userId: string; galleryId: string };

async function seedGallery(
  auth: AuthService,
  users: UsersService,
  galleries: Repository<Gallery>,
  creds: GalleryCreds,
): Promise<SeededGallery> {
  const user = await auth.register({
    email: creds.email,
    password: creds.password,
    role: UserRole.GALLERY,
    name: creds.name,
  });
  await users.activate(user.id);
  const gallery = await galleries.findOneOrFail({
    where: { user: { id: user.id } },
  });
  return {
    payload: { sub: user.id, role: UserRole.GALLERY },
    userId: user.id,
    galleryId: gallery.id,
  };
}

async function seedDemo(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const users = app.get(UsersService);

    if (await users.existsByEmail(GALLERY_LUMIERE.email)) {
      console.log('Demo data already present — nothing to do.');
      return;
    }

    const auth = app.get(AuthService);
    const artists = app.get(ArtistsService);
    const artworks = app.get(ArtworksService);
    const purchaseRequests = app.get(PurchaseRequestsService);
    const sales = app.get(SalesService);
    const exhibitions = app.get(ExhibitionsService);
    const loans = app.get(LoansService);
    const dataSource = app.get(DataSource);
    const galleryRepo = dataSource.getRepository(Gallery);
    const collectorRepo = dataSource.getRepository(Collector);

    const lumiere = await seedGallery(
      auth,
      users,
      galleryRepo,
      GALLERY_LUMIERE,
    );
    const horizon = await seedGallery(
      auth,
      users,
      galleryRepo,
      GALLERY_HORIZON,
    );

    const frida = await artists.create(
      { ...ARTISTS.frida, password: ARTIST_PASSWORD },
      lumiere.payload,
    );
    const soulages = await artists.create(
      { ...ARTISTS.soulages, password: ARTIST_PASSWORD },
      lumiere.payload,
    );
    const basquiat = await artists.create(
      { ...ARTISTS.basquiat, password: ARTIST_PASSWORD },
      horizon.payload,
    );

    const composition = await artworks.create(
      {
        title: 'Composition en noir',
        technique: 'Huile sur toile',
        salePrice: 8000,
        reservePrice: 6000,
        artistId: frida.id,
        consignedAt: '2026-03-01',
      },
      lumiere.payload,
    );
    const outrenoir = await artworks.create(
      {
        title: 'Outrenoir 1979',
        technique: 'Peinture sur toile',
        salePrice: 25000,
        reservePrice: 18000,
        artistId: soulages.id,
        consignedAt: '2026-03-04',
      },
      lumiere.payload,
    );
    const etude = await artworks.create(
      {
        title: 'Étude au fusain',
        technique: 'Fusain sur papier',
        salePrice: 3500,
        reservePrice: 3000,
        artistId: frida.id,
        consignedAt: '2026-03-06',
      },
      lumiere.payload,
    );
    const sansTitre = await artworks.create(
      {
        title: 'Sans titre 12',
        technique: 'Acrylique',
        salePrice: 12000,
        reservePrice: 9000,
        artistId: soulages.id,
        consignedAt: '2026-03-08',
      },
      lumiere.payload,
    );
    const crownStudy = await artworks.create(
      {
        title: 'Crown study',
        technique: 'Techniques mixtes',
        salePrice: 4000,
        reservePrice: 3000,
        artistId: basquiat.id,
        consignedAt: '2026-03-12',
      },
      horizon.payload,
    );

    const collectorUser = await auth.register({
      email: COLLECTOR.email,
      password: COLLECTOR.password,
      role: UserRole.COLLECTOR,
      firstName: COLLECTOR.firstName,
      lastName: COLLECTOR.lastName,
      name: '',
    });
    const collector = await collectorRepo.findOneOrFail({
      where: { user: { id: collectorUser.id } },
    });
    const collectorPayload: JwtPayload = {
      sub: collectorUser.id,
      role: UserRole.COLLECTOR,
    };

    const request = await purchaseRequests.create(
      { artworkId: composition.id },
      collectorPayload,
    );
    await purchaseRequests.confirm(request.id, lumiere.payload);

    await sales.create(
      {
        artworkId: outrenoir.id,
        collectorId: collector.id,
        salePrice: 25000,
      },
      lumiere.payload,
    );

    await exhibitions.create(
      {
        name: 'Rétrospective 2026',
        startDate: '2026-06-01',
        endDate: '2026-09-30',
        location: 'Paris 3e',
        artworkIds: [etude.id],
      },
      lumiere.payload,
    );

    await loans.create(
      {
        artworkId: sansTitre.id,
        destinationGalleryId: horizon.galleryId,
        startDate: '2026-07-01',
        endDate: '2026-08-15',
        conditions: "Assurance clou à clou à la charge de l'emprunteur",
      },
      lumiere.payload,
    );

    console.log(
      [
        'Demo data seeded.',
        '',
        `  Galerie Lumière  ${GALLERY_LUMIERE.email} / ${GALLERY_LUMIERE.password}`,
        `    gallery id   ${lumiere.galleryId}`,
        `  Galerie Horizon  ${GALLERY_HORIZON.email} / ${GALLERY_HORIZON.password}`,
        `    gallery id   ${horizon.galleryId}   <- destinationGalleryId / toGalleryId`,
        `  Collector        ${COLLECTOR.email} / ${COLLECTOR.password}`,
        `    collector id ${collector.id}   <- collectorId pour POST /sales`,
        `  Artistes (mdp ${ARTIST_PASSWORD}): ${ARTISTS.frida.email}, ${ARTISTS.soulages.email}, ${ARTISTS.basquiat.email}`,
        '',
        '  Œuvres :',
        `    ${composition.id}  Composition en noir  (vendue via demande d'achat)`,
        `    ${outrenoir.id}  Outrenoir 1979       (vendue en direct)`,
        `    ${etude.id}  Étude au fusain      (exposée)`,
        `    ${sansTitre.id}  Sans titre 12        (en prêt chez Horizon)`,
        `    ${crownStudy.id}  Crown study          (disponible)`,
      ].join('\n'),
    );
  } finally {
    await app.close();
  }
}

seedDemo().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
