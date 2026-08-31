import { MigrationInterface, QueryRunner } from "typeorm";

export class DropGalleryIsValidated1788215192892 implements MigrationInterface {
    name = 'DropGalleryIsValidated1788215192892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "galleries" DROP COLUMN "isValidated"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "galleries" ADD "isValidated" boolean NOT NULL DEFAULT false`);
    }

}
