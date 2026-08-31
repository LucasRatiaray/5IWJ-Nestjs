import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1788148865760 implements MigrationInterface {
    name = 'InitSchema1788148865760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."artwork_status_histories_fromstatus_enum" AS ENUM('available', 'on_loan', 'sold', 'returned')`);
        await queryRunner.query(`CREATE TYPE "public"."artwork_status_histories_tostatus_enum" AS ENUM('available', 'on_loan', 'sold', 'returned')`);
        await queryRunner.query(`CREATE TABLE "artwork_status_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromStatus" "public"."artwork_status_histories_fromstatus_enum", "toStatus" "public"."artwork_status_histories_tostatus_enum" NOT NULL, "changedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reason" text, "artworkId" uuid NOT NULL, CONSTRAINT "PK_ca4ec160df85b6a27d33a4cf9ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(12,2) NOT NULL, "issuedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "saleId" uuid NOT NULL, CONSTRAINT "REL_23de94fa7468d27abfa62f9e27" UNIQUE ("saleId"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "artist_statements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(12,2) NOT NULL, "issuedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "saleId" uuid NOT NULL, CONSTRAINT "REL_085ae4352b5859da0336eea1f8" UNIQUE ("saleId"), CONSTRAINT "PK_cb794a1b330bb23aec85298fc6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "collectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying, "lastName" character varying, "userId" uuid NOT NULL, CONSTRAINT "REL_c34a51e6d3cc0caad2667c4cc5" UNIQUE ("userId"), CONSTRAINT "PK_da4185226ea730100d5aa647afe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "salePrice" numeric(12,2) NOT NULL, "commissionRate" numeric(5,4) NOT NULL, "commissionAmount" numeric(12,2) NOT NULL, "artistBalance" numeric(12,2) NOT NULL, "soldAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "artworkId" uuid NOT NULL, "collectorId" uuid NOT NULL, CONSTRAINT "REL_f09126464ec078856b736ccdc9" UNIQUE ("artworkId"), CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exhibitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "location" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0f4f908f4d38be7ab76b32aead7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "loans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" date NOT NULL, "endDate" date NOT NULL, "conditions" text, "artworkId" uuid NOT NULL, "source_gallery_id" uuid NOT NULL, "destination_gallery_id" uuid NOT NULL, CONSTRAINT "PK_5c6942c1e13e4de135c5203ee61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."artworks_status_enum" AS ENUM('available', 'on_loan', 'sold', 'returned')`);
        await queryRunner.query(`CREATE TABLE "artworks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "creationYear" integer, "technique" character varying NOT NULL, "height" numeric(8,2), "width" numeric(8,2), "depth" numeric(8,2), "salePrice" numeric(12,2) NOT NULL, "reservePrice" numeric(12,2) NOT NULL, "status" "public"."artworks_status_enum" NOT NULL DEFAULT 'available', "imageUrl" character varying, "consignedAt" date NOT NULL, "galleryId" uuid NOT NULL, "artistId" uuid NOT NULL, CONSTRAINT "PK_e452ea65fb5958274badfe245de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71bc10c0dfa9385e3d9f41a7ba" ON "artworks"  ("status") `);
        await queryRunner.query(`CREATE TABLE "galleries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying, "isValidated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "REL_22c8efdc30dbfd0af55ed08c9c" UNIQUE ("userId"), CONSTRAINT "PK_86b77299615c92db3d68c9c7919" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'gallery', 'artist', 'collector')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'collector', "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."artists_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "artists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "biography" text, "portfolioUrl" character varying, "nationality" character varying, "status" "public"."artists_status_enum" NOT NULL DEFAULT 'active', "joinedAt" date NOT NULL, "userId" uuid, "galleryId" uuid NOT NULL, CONSTRAINT "REL_f7bd9114dc2849a90d39512911" UNIQUE ("userId"), CONSTRAINT "PK_09b823d4607d2675dc4ffa82261" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."artist_transfer_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "artist_transfer_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."artist_transfer_requests_status_enum" NOT NULL DEFAULT 'pending', "requestedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "decidedAt" TIMESTAMP WITH TIME ZONE, "artistId" uuid NOT NULL, "from_gallery_id" uuid NOT NULL, "to_gallery_id" uuid NOT NULL, "decidedById" uuid, CONSTRAINT "PK_19762549fe02bbe663186b099d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exhibition_artworks" ("exhibitionsId" uuid NOT NULL, "artworksId" uuid NOT NULL, CONSTRAINT "PK_ee39a6a126ad0d004d701dd8766" PRIMARY KEY ("exhibitionsId", "artworksId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c072390670bc605d4d23894cc1" ON "exhibition_artworks"  ("exhibitionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b904f012cbc945c6b58e797ff" ON "exhibition_artworks"  ("artworksId") `);
        await queryRunner.query(`ALTER TABLE "artwork_status_histories" ADD CONSTRAINT "FK_d1fb74726d991c7cda11f38f93d" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_23de94fa7468d27abfa62f9e275" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artist_statements" ADD CONSTRAINT "FK_085ae4352b5859da0336eea1f85" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collectors" ADD CONSTRAINT "FK_c34a51e6d3cc0caad2667c4cc52" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_f09126464ec078856b736ccdc94" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_c70286dac915841dfc7474922da" FOREIGN KEY ("collectorId") REFERENCES "collectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loans" ADD CONSTRAINT "FK_584f4ef5d8e725c3dbe037318ec" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loans" ADD CONSTRAINT "FK_2421a7201b1328c1d983a7c9152" FOREIGN KEY ("source_gallery_id") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loans" ADD CONSTRAINT "FK_9912327dcbd8fa4de52f8818755" FOREIGN KEY ("destination_gallery_id") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artworks" ADD CONSTRAINT "FK_a3cae9fd1dfb68df22dd05d5bd1" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artworks" ADD CONSTRAINT "FK_b28e5816ef5870335179a7d8228" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "galleries" ADD CONSTRAINT "FK_22c8efdc30dbfd0af55ed08c9ce" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artists" ADD CONSTRAINT "FK_f7bd9114dc2849a90d39512911b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artists" ADD CONSTRAINT "FK_d830b928c6ae44ad93b9a92d951" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" ADD CONSTRAINT "FK_40f1f0544a955f756298f2b4beb" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" ADD CONSTRAINT "FK_e2fc892d539ef5a6c5b7b4f2655" FOREIGN KEY ("from_gallery_id") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" ADD CONSTRAINT "FK_441ed57b37f9f950c4334362554" FOREIGN KEY ("to_gallery_id") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" ADD CONSTRAINT "FK_0c718c2eaea83a004ecdda39586" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exhibition_artworks" ADD CONSTRAINT "FK_c072390670bc605d4d23894cc1e" FOREIGN KEY ("exhibitionsId") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "exhibition_artworks" ADD CONSTRAINT "FK_9b904f012cbc945c6b58e797ff6" FOREIGN KEY ("artworksId") REFERENCES "artworks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exhibition_artworks" DROP CONSTRAINT "FK_9b904f012cbc945c6b58e797ff6"`);
        await queryRunner.query(`ALTER TABLE "exhibition_artworks" DROP CONSTRAINT "FK_c072390670bc605d4d23894cc1e"`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" DROP CONSTRAINT "FK_0c718c2eaea83a004ecdda39586"`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" DROP CONSTRAINT "FK_441ed57b37f9f950c4334362554"`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" DROP CONSTRAINT "FK_e2fc892d539ef5a6c5b7b4f2655"`);
        await queryRunner.query(`ALTER TABLE "artist_transfer_requests" DROP CONSTRAINT "FK_40f1f0544a955f756298f2b4beb"`);
        await queryRunner.query(`ALTER TABLE "artists" DROP CONSTRAINT "FK_d830b928c6ae44ad93b9a92d951"`);
        await queryRunner.query(`ALTER TABLE "artists" DROP CONSTRAINT "FK_f7bd9114dc2849a90d39512911b"`);
        await queryRunner.query(`ALTER TABLE "galleries" DROP CONSTRAINT "FK_22c8efdc30dbfd0af55ed08c9ce"`);
        await queryRunner.query(`ALTER TABLE "artworks" DROP CONSTRAINT "FK_b28e5816ef5870335179a7d8228"`);
        await queryRunner.query(`ALTER TABLE "artworks" DROP CONSTRAINT "FK_a3cae9fd1dfb68df22dd05d5bd1"`);
        await queryRunner.query(`ALTER TABLE "loans" DROP CONSTRAINT "FK_9912327dcbd8fa4de52f8818755"`);
        await queryRunner.query(`ALTER TABLE "loans" DROP CONSTRAINT "FK_2421a7201b1328c1d983a7c9152"`);
        await queryRunner.query(`ALTER TABLE "loans" DROP CONSTRAINT "FK_584f4ef5d8e725c3dbe037318ec"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_c70286dac915841dfc7474922da"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_f09126464ec078856b736ccdc94"`);
        await queryRunner.query(`ALTER TABLE "collectors" DROP CONSTRAINT "FK_c34a51e6d3cc0caad2667c4cc52"`);
        await queryRunner.query(`ALTER TABLE "artist_statements" DROP CONSTRAINT "FK_085ae4352b5859da0336eea1f85"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_23de94fa7468d27abfa62f9e275"`);
        await queryRunner.query(`ALTER TABLE "artwork_status_histories" DROP CONSTRAINT "FK_d1fb74726d991c7cda11f38f93d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b904f012cbc945c6b58e797ff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c072390670bc605d4d23894cc1"`);
        await queryRunner.query(`DROP TABLE "exhibition_artworks"`);
        await queryRunner.query(`DROP TABLE "artist_transfer_requests"`);
        await queryRunner.query(`DROP TYPE "public"."artist_transfer_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "artists"`);
        await queryRunner.query(`DROP TYPE "public"."artists_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "galleries"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71bc10c0dfa9385e3d9f41a7ba"`);
        await queryRunner.query(`DROP TABLE "artworks"`);
        await queryRunner.query(`DROP TYPE "public"."artworks_status_enum"`);
        await queryRunner.query(`DROP TABLE "loans"`);
        await queryRunner.query(`DROP TABLE "exhibitions"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`DROP TABLE "collectors"`);
        await queryRunner.query(`DROP TABLE "artist_statements"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "artwork_status_histories"`);
        await queryRunner.query(`DROP TYPE "public"."artwork_status_histories_tostatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."artwork_status_histories_fromstatus_enum"`);
    }

}
