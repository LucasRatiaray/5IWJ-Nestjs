import { MigrationInterface, QueryRunner } from "typeorm";

export class SetUserActiveByDefault1788189890109 implements MigrationInterface {
    name = 'SetUserActiveByDefault1788189890109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT false`);
    }

}
