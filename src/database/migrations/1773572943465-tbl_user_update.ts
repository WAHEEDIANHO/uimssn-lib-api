import { MigrationInterface, QueryRunner } from "typeorm";

export class TblUserUpdate1773572943465 implements MigrationInterface {
    name = 'TblUserUpdate1773572943465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_users" DROP COLUMN "isPhoneNumberVerified"`);
        await queryRunner.query(`ALTER TABLE "tbl_users" DROP COLUMN "mfa_secret"`);
        await queryRunner.query(`ALTER TABLE "tbl_users" DROP COLUMN "is_mfa_enabled"`);
        await queryRunner.query(`ALTER TABLE "tbl_users" DROP COLUMN "is_mfa_started"`);
        await queryRunner.query(`ALTER TABLE "tbl_users" DROP COLUMN "recovery_code"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_users" ADD "recovery_code" character varying`);
        await queryRunner.query(`ALTER TABLE "tbl_users" ADD "is_mfa_started" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tbl_users" ADD "is_mfa_enabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tbl_users" ADD "mfa_secret" character varying`);
        await queryRunner.query(`ALTER TABLE "tbl_users" ADD "isPhoneNumberVerified" boolean NOT NULL DEFAULT false`);
    }

}
