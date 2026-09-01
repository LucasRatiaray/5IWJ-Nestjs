import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseRequests1788312000000 implements MigrationInterface {
    name = 'AddPurchaseRequests1788312000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."purchase_requests_status_enum" AS ENUM('pending', 'confirmed', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "purchase_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."purchase_requests_status_enum" NOT NULL DEFAULT 'pending', "requestedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "collectorId" uuid NOT NULL, "artworkId" uuid NOT NULL, CONSTRAINT "PK_purchase_requests" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchase_requests" ADD CONSTRAINT "FK_purchase_requests_collector" FOREIGN KEY ("collectorId") REFERENCES "collectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_requests" ADD CONSTRAINT "FK_purchase_requests_artwork" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_requests" DROP CONSTRAINT "FK_purchase_requests_artwork"`);
        await queryRunner.query(`ALTER TABLE "purchase_requests" DROP CONSTRAINT "FK_purchase_requests_collector"`);
        await queryRunner.query(`DROP TABLE "purchase_requests"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_requests_status_enum"`);
    }

}
