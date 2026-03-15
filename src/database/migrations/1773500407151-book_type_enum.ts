import { MigrationInterface, QueryRunner } from "typeorm";

export class BookTypeEnum1773500407151 implements MigrationInterface {
    name = 'BookTypeEnum1773500407151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_type_enum"`);
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" ADD "type" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_type_enum" AS ENUM('Physical', 'Digital')`);
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" ADD "type" "public"."tbl_book_catalogues_type_enum" NOT NULL`);
    }

}
