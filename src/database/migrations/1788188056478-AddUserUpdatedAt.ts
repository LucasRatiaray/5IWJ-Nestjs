import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserUpdatedAt1788188056478 implements MigrationInterface {
    name = 'AddUserUpdatedAt1788188056478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    }

}
