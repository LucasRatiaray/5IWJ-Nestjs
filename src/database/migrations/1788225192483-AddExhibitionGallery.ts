import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExhibitionGallery1788225192483 implements MigrationInterface {
    name = 'AddExhibitionGallery1788225192483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exhibitions" ADD "galleryId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exhibitions" ADD CONSTRAINT "FK_98aca36ae8892141d7199805fab" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exhibitions" DROP CONSTRAINT "FK_98aca36ae8892141d7199805fab"`);
        await queryRunner.query(`ALTER TABLE "exhibitions" DROP COLUMN "galleryId"`);
    }

}
