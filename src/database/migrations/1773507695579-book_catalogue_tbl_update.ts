import { MigrationInterface, QueryRunner } from "typeorm";

export class BookCatalogueTblUpdate1773507695579 implements MigrationInterface {
    name = 'BookCatalogueTblUpdate1773507695579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_type_enum" AS ENUM('Physical', 'Digital')`);
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" ADD "type" "public"."tbl_book_catalogues_type_enum" NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_5748606f7a4bd7e036055cbe0f" ON "tbl_book_catalogues" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_56cb3e7c7f610f31e8b9e668a9" ON "tbl_book_catalogues" ("author") `);
        await queryRunner.query(`CREATE INDEX "IDX_3739bbaeaf1e9160207aefc756" ON "tbl_book_catalogues" ("categories") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3739bbaeaf1e9160207aefc756"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_56cb3e7c7f610f31e8b9e668a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5748606f7a4bd7e036055cbe0f"`);
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_type_enum"`);
        await queryRunner.query(`ALTER TABLE "tbl_book_catalogues" ADD "type" jsonb NOT NULL DEFAULT '[]'`);
    }

}
